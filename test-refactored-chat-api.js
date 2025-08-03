// Test script to verify the refactored chat API response format

async function testChatAPI() {
  const testCases = [
    {
      name: "Bitcoin query",
      message: "What is the current outlook for Bitcoin?",
      session_id: null,
    },
    {
      name: "Ethereum query",
      message: "Tell me about Ethereum price prospects",
      session_id: "test-session-123",
    },
    {
      name: "General query",
      message: "Hello, how are you?",
      session_id: null,
    },
  ];

  console.log("Testing refactored Chat API...\n");

  for (const testCase of testCases) {
    console.log(`\n🧪 Test: ${testCase.name}`);
    console.log(`   Message: "${testCase.message}"`);

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testCase.message,
          session_id: testCase.session_id,
        }),
      });

      const data = await response.json();

      console.log("\n✅ Response structure:");
      console.log(
        `   - session_id: ${data.session_id ? "✓" : "✗"} ${data.session_id}`,
      );
      console.log(
        `   - outputs array: ${Array.isArray(data.outputs) ? "✓" : "✗"}`,
      );

      if (data.outputs?.[0]) {
        const output = data.outputs[0];
        console.log(
          `   - inputs.input_value: ${output.inputs?.input_value ? "✓" : "✗"}`,
        );
        console.log(
          `   - outputs array: ${Array.isArray(output.outputs) ? "✓" : "✗"}`,
        );

        if (output.outputs?.[0]) {
          const result = output.outputs[0];
          console.log(
            `   - results.message: ${result.results?.message ? "✓" : "✗"}`,
          );
          console.log(`   - artifacts: ${result.artifacts ? "✓" : "✗"}`);
          console.log(`   - component_id: ${result.component_id ? "✓" : "✗"}`);

          if (result.results?.message) {
            const msg = result.results.message;
            console.log(`   - message.text: ${msg.text ? "✓" : "✗"}`);
            console.log(
              `   - message.sender: ${msg.sender ? "✓" : "✗"} (${msg.sender})`,
            );
            console.log(
              `   - message.properties: ${msg.properties ? "✓" : "✗"}`,
            );

            // Show a preview of the text
            if (msg.text) {
              const preview = msg.text.substring(0, 100).replace(/\n/g, " ");
              console.log(`\n   📝 Text preview: "${preview}..."`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }
  }

  console.log("\n\n✨ Test complete!");
}

// Check if server is running
fetch("http://localhost:3000/api/chat")
  .then(() => testChatAPI())
  .catch(() =>
    console.error(
      "❌ Server is not running. Please start the Next.js server first.",
    ),
  );
