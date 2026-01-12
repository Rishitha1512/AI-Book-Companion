export async function POST() {
  return new Response(
    JSON.stringify({ message: "Upload route working" }),
    { headers: { "Content-Type": "application/json" } }
  );
}