import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

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

export async function GET() {
  const client = await getClient();
  const db = client.db(dbName);
  const notes = await db.collection("notes").find({}).sort({ _id: -1 }).toArray();
  return NextResponse.json(notes.map(({ _id, ...rest }) => ({ id: _id, ...rest })));
}

export async function POST(req: NextRequest) {
  const client = await getClient();
  const db = client.db(dbName);
  const { text, imageUrl } = await req.json();
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }
  const note: { text: string; likes: number; imageUrl?: string } = { text, likes: 0 };
  if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
    note.imageUrl = imageUrl.trim();
  }
  const result = await db.collection("notes").insertOne(note);
  return NextResponse.json({ id: result.insertedId, ...note });
}

export async function PATCH(req: NextRequest) {
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

  const note = await db.collection("notes").findOne({ _id: new ObjectId(id), likedBy: userIp });
  if (note) {
    return NextResponse.json({ error: "Already liked" }, { status: 403 });
  }
  await db.collection("notes").updateOne(
    { _id: new ObjectId(id) },
    { $inc: { likes: 1 }, $addToSet: { likedBy: userIp } }
  );
  const updated = await db.collection("notes").findOne({ _id: new ObjectId(id) });
  return NextResponse.json({ id, text: updated?.text, likes: updated?.likes, imageUrl: updated?.imageUrl });
}
