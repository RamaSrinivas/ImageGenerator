import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error:
            "OPENAI_API_KEY is not configured in Vercel."
        },
        {
          status: 500
        }
      );
    }

    const formData = await request.formData();

    const prompt =
      String(formData.get("prompt") || "").trim();

    const image =
      formData.get("image");


    if (!prompt) {
      return Response.json(
        {
          error: "Prompt is required."
        },
        {
          status: 400
        }
      );
    }


    const client =
      new OpenAI({
        apiKey
      });


    /*
     * Build the user input.
     */

    const content = [
      {
        type: "input_text",

        text:
          "Create the requested editorial image. " +
          "The subject must be an adult. " +
          "Keep the result tasteful and non-explicit. " +
          "Use realistic anatomy, realistic skin texture, " +
          "professional photography and natural lighting. " +
          "When a reference image is supplied, use it as a " +
          "visual reference for the subject's appearance. " +
          "Do not create transparent or sexually explicit clothing.\n\n" +
          prompt
      }
    ];


    /*
     * Add reference image when supplied.
     */

    if (
      image &&
      typeof image.arrayBuffer === "function"
    ) {

      const buffer =
        Buffer.from(
          await image.arrayBuffer()
        );


      const mimeType =
        image.type || "image/jpeg";


      const base64 =
        buffer.toString("base64");


      const dataUrl =
        `data:${mimeType};base64,${base64}`;


      content.push({
        type: "input_image",

        image_url: dataUrl,

        detail: "high"
      });
    }


    /*
     * Generate / edit the image.
     */

    const response =
      await client.responses.create({

        /*
         * Mainline model that can use
         * the image-generation tool.
         */

        model: "gpt-6-astra",


        input: [
          {
            role: "user",
            content
          }
        ],


        tools: [
          {
            type: "image_generation",

            model:
              "gpt-image-2.5-flare",

            action:
              image
                ? "edit"
                : "generate",

            size:
              "1024x1536",

            quality:
              "high"
          }
        ],


        tool_choice: {
          type: "image_generation"
        }

      });


    /*
     * Find the generated image.
     */

    const imageResult =
      response.output.find(
        item =>
          item.type ===
          "image_generation_call"
      );


    if (
      !imageResult ||
      !imageResult.result
    ) {

      return Response.json(
        {
          error:
            "OpenAI did not return an image."
        },
        {
          status: 502
        }
      );
    }


    /*
     * Return base64 image to browser.
     */

    return Response.json({
      ok: true,

      image:
        `data:image/png;base64,${imageResult.result}`
    });


  } catch (error) {

    console.error(
      "IMAGE GENERATION ERROR:",
      error
    );


    return Response.json(
      {
        error:
          error?.message ||
          "Unexpected image generation error."
      },
      {
        status: 500
      }
    );
  }
}
