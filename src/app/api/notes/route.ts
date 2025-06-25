import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId, Collection, Document } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "love_wall";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient;
}

export async function GET(req: NextRequest) {
  const client = await getClient();
  const db = client.db(dbName);

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort");
  let sortObj: Record<string, 1 | -1> = { _id: -1 };
  if (sort === "popular") {
    sortObj = { likes: -1, _id: -1 };
  }
  const notes = await db.collection("notes").find({}).sort(sortObj).toArray();
  return NextResponse.json(notes.map(({ _id, text, likes, imageUrl, senderIp, createdAt, likedBy }) => ({ id: _id, text, likes, imageUrl, senderIp, createdAt, likedBy })));
}

export async function POST(req: NextRequest) {
  const client = await getClient();
  const db = client.db(dbName);
  const { text, imageUrl } = await req.json();

  let senderIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!senderIp) {
    senderIp = req.headers.get("x-real-ip") || "unknown";
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }
  const note: { text: string; likes: number; imageUrl?: string; senderIp?: string; createdAt: string } = {
    text,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
    note.imageUrl = imageUrl.trim();
  }
  if (senderIp && senderIp !== "unknown") {
    note.senderIp = senderIp;
  }
  const result = await db.collection("notes").insertOne(note);
  return NextResponse.json({ id: result.insertedId, ...note });
}

export async function PATCH(req: NextRequest) {
  const client = await getClient();
  const db = client.db(dbName);
  const notesCollection: Collection<Document> = db.collection("notes");

  let userIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!userIp) {
    userIp = req.headers.get("x-real-ip") || "unknown";
  }
  if (!userIp || userIp === "unknown") {
    return NextResponse.json({ error: "Could not determine user IP" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const note = await notesCollection.findOne({ _id: new ObjectId(id), likedBy: userIp });
  if (note) {
    await notesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: -1 }, $pull: { likedBy: userIp } }
    );
  } else {
    await notesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 }, $addToSet: { likedBy: userIp } }
    );
  }
  const updated = await notesCollection.findOne({ _id: new ObjectId(id) });
  return NextResponse.json({
    id,
    text: updated?.text,
    likes: updated?.likes,
    imageUrl: updated?.imageUrl,
    likedBy: updated?.likedBy,
  });
}

export async function DELETE(req: NextRequest) {
  const client = await getClient();
  const db = client.db(dbName);
  let userIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!userIp) {
    userIp = req.headers.get("x-real-ip") || "unknown";
  }
  if (!userIp || userIp === "unknown") {
    return NextResponse.json({ error: "Could not determine user IP" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const note = await db.collection("notes").findOne({ _id: new ObjectId(id) });
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  if (note.senderIp !== userIp) {
    return NextResponse.json({ error: "Not authorized to delete this note" }, { status: 403 });
  }
  await db.collection("notes").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

export async function HEAD(req: NextRequest) {

  let userIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!userIp) {
    userIp = req.headers.get("x-real-ip") || "unknown";
  }
  return NextResponse.json({ ip: userIp });
}
