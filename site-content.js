async function loadSiteContent() {
    try {
        const response = await fetch(new URL("site-content.json", document.baseURI), { cache: "no-store" });
        if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
        const content = await response.json();

        if (content.specials) {
            const specials = document.getElementById("specials-content");
            specials.replaceChildren();
            [content.specials.description, content.specials.happy_hour,
             content.specials.schedule, content.specials.sunday]
                .filter(Boolean)
                .forEach((text) => {
                    const paragraph = document.createElement("p");
                    paragraph.textContent = text;
                    specials.append(paragraph);
                });
        }

        if (Array.isArray(content.events)) {
            const events = document.getElementById("events-grid");
            events.replaceChildren();
            content.events.forEach((event) => {
                const card = document.createElement("div");
                card.className = "card";
                const title = document.createElement("h3");
                title.textContent = event.title || "Event";
                card.append(title);
                (Array.isArray(event.details) ? event.details : [event.details])
                    .filter(Boolean)
                    .forEach((detail) => {
                        const paragraph = document.createElement("p");
                        paragraph.textContent = detail;
                        card.append(paragraph);
                    });
                events.append(card);
            });
        }

        if (Array.isArray(content.gallery)) {
            const gallery = document.getElementById("gallery-grid");
            gallery.replaceChildren();
            content.gallery.filter((photo) => photo.image).forEach((photo) => {
                const image = document.createElement("img");
                image.src = photo.image;
                image.alt = photo.alt || "Kozee Lounge memory";
                image.loading = "lazy";
                gallery.append(image);
            });
        }
    } catch (error) {
        // Keep the HTML's built-in fallback content visible if the JSON cannot load.
        console.error("Could not load editable site content:", error);
    }
}

loadSiteContent();
