export function loadGoogleMaps(callback: any) {
  const existingScript = document.getElementById("google-maps");

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAuRDCf0S1SWR3SNxj59tjTAC0QZGO5JJ4&libraries=places`;
    script.id = "google-maps";
    document.body.appendChild(script);

    script.onload = () => {
      if (callback) callback();
    };
  }

  if (existingScript && callback) callback();
}
