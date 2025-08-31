document.getElementById("closeBtn").addEventListener("click", () => {
  window.electron.closeApp();
});

document.getElementById("minimizeBtn").addEventListener("click", () => {
  window.electron.minimizeApp();
});

document.getElementById("captureBtn").addEventListener("click", async () => {
  // Clear the previous result
  const result = document.getElementById("result");
  result.textContent = "";
  // Capture new screenshot
  const dataURL = await window.electron.captureScreen();
  const img = document.getElementById("screenshot");
  img.src = dataURL;

  const ansBtn = document.getElementById("Ans");
  ansBtn.style.display = "inline-block"; // Show the Get Ans button
  ansBtn.disabled = false; // Make sure it's enabled again
  ansBtn.innerText = "Get Ans"; // Reset text
});

document.getElementById("Ans").addEventListener("click", async () => {
  const img = document.getElementById("screenshot");
  const blob = await dataURLToBlob(img.src);
  const spinner = document.getElementById("spinner");
  const result = document.getElementById("result");
  const ansBtn = document.getElementById("Ans");

  // Disable button while processing
  ansBtn.disabled = true;
  ansBtn.innerText = "Processing...";

  // Clear previous result and show spinner
  result.textContent = "";
  spinner.style.display = "block";

  // Define your API endpoint here
  const apiEndpoint =
    "https://quizbababackend-abdulislams-projects.vercel.app/api/upload";

  // Create form data
  const formData = new FormData();
  formData.append("image", blob, "screenshot.png");

  // Send the image to the API endpoint
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const resultData = await response.json();
      result.textContent = resultData.aiResponse;
    } else {
      console.error("Failed to upload image:", response.statusText);
      result.textContent = "Failed to get response";
    }
  } catch (error) {
    result.textContent = "Error getting response";
  } finally {
    // Hide spinner and re-enable button
    spinner.style.display = "none";
    ansBtn.disabled = false;
    ansBtn.innerText = "Get Ans";
  }
});

function dataURLToBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Hide the Get Ans button initially
document.getElementById("Ans").style.display = "none";
