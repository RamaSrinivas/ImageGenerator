"use client";

import { useState } from "react";

const presets = {
  "Gym Editorial": `Create a photorealistic, high-resolution editorial lifestyle portrait of an adult woman in a premium modern gym. Use fully opaque premium athletic wear: a fitted workout top and high-waisted athletic leggings. Natural body proportions, realistic skin texture, realistic hands and anatomy, confident natural pose, professional camera quality, cinematic natural lighting, shallow depth of field, soft background bokeh, realistic gym equipment and mirrors. Tasteful, non-explicit fashion photography. No text or watermark.`,

  "Poolside Editorial": `Create a photorealistic, high-resolution editorial lifestyle portrait of an adult woman beside a luxury swimming pool. Use tasteful, fully opaque premium swimwear with normal coverage. Natural body proportions, realistic skin texture, confident elegant pose, professional fashion photography, bright natural light, subtle reflections, shallow depth of field and soft background bokeh. Tasteful, non-explicit. No text or watermark.`,

  "Fashion Editorial": `Create a photorealistic high-end fashion editorial portrait of an adult woman in a modern architectural setting. Elegant fully opaque designer-inspired clothing, realistic fabric texture, natural anatomy, realistic skin texture, confident pose, professional camera quality, cinematic lighting and shallow depth of field. Tasteful, non-explicit. No text or watermark.`,

  "Portrait": `Create a photorealistic premium editorial portrait of an adult woman. Preserve natural facial characteristics from the reference image when provided. Realistic skin texture, natural anatomy, professional camera quality, elegant expression, cinematic natural lighting, shallow depth of field and soft bokeh. No text or watermark.`
};

export default function Home() {
  const [preset, setPreset] = useState("Gym Editorial");
  const [prompt, setPrompt] = useState(presets["Gym Editorial"]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready.");

  function changePreset(value) {
    setPreset(value);
    setPrompt(presets[value]);
  }

  function chooseFile(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setStatus("Reference image selected.");
  }

  async function generate() {
    if (!prompt.trim()) {
      setStatus("Please enter a prompt.");
      return;
    }

    setBusy(true);
    setResult("");
    setStatus("Generating image. Please wait...");

    try {
      const form = new FormData();

      form.append("prompt", prompt);
      form.append("preset", preset);

      if (file) {
        form.append("image", file);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Image generation failed."
        );
      }

      setResult(data.image);
      setStatus("Image generated successfully.");

    } catch (error) {

      setStatus(
        "ERROR: " + error.message
      );

    } finally {

      setBusy(false);

    }
  }

  return (
    <main className="page">

      <section className="hero">

        <div className="eyebrow">
          AI CREATIVE STUDIO
        </div>

        <h1>
          Editorial Image Generator
        </h1>

        <p>
          Generate polished, photorealistic editorial
          images from a prompt or uploaded reference image.
        </p>

      </section>


      <section className="grid">

        <div className="card">

          <h2>
            1. Reference Image
          </h2>

          <label className="upload">

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={chooseFile}
            />

            <span>
              {file
                ? "Change reference image"
                : "Choose reference image"}
            </span>

          </label>


          {preview && (
            <img
              className="reference"
              src={preview}
              alt="Reference preview"
            />
          )}


          <h2>
            2. Style
          </h2>

          <select
            value={preset}
            onChange={(event) =>
              changePreset(event.target.value)
            }
          >

            {Object.keys(presets).map((name) => (
              <option key={name}>
                {name}
              </option>
            ))}

          </select>


          <h2>
            3. Prompt
          </h2>

          <textarea
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
          />


          <button
            className="generate"
            onClick={generate}
            disabled={busy}
          >
            {busy
              ? "GENERATING..."
              : "GENERATE IMAGE"}
          </button>


          <div className="status">
            {status}
          </div>

        </div>


        <div className="card resultCard">

          <h2>
            Generated Image
          </h2>


          {!result && !busy && (
            <div className="empty">

              <div className="emptyIcon">
                ✦
              </div>

              <p>
                Your generated image will appear here.
              </p>

            </div>
          )}


          {busy && (
            <div className="empty">

              <div className="spinner" />

              <p>
                Creating your image...
              </p>

            </div>
          )}


          {result && (
            <>

              <img
                className="result"
                src={result}
                alt="Generated result"
              />

              <a
                className="download"
                href={result}
                download="editorial-image.png"
              >
                DOWNLOAD IMAGE
              </a>

            </>
          )}

        </div>

      </section>


      <footer>
        Your OpenAI API key is stored only
        in Vercel server-side environment variables.
      </footer>

    </main>
  );
}
