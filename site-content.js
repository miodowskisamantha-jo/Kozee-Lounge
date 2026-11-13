async function loadSiteContent() {
    try {
        const response = await fetch(new URL("site-content.json", document.baseURI), { cache: "no-store" });
        if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
        const content = await response.json();

        if (content.specials) {
            const specials = document.getElementById("specials-content");
            if (specials) {
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
        }

        const renderCards = (containerId, items, fallbackTitle) => {
            const container = document.getElementById(containerId);
            if (!container || !Array.isArray(items)) return;
            container.replaceChildren();
            items.forEach((item) => {
                const card = document.createElement("article");
                card.className = "card";
                const titleText = item.title || fallbackTitle;
                if (/husker/i.test(titleText)) card.classList.add("husker-neon");
                const title = document.createElement("h3");
                title.textContent = titleText;
                card.append(title);
                (Array.isArray(item.details) ? item.details : [item.details])
                    .filter(Boolean)
                    .forEach((detail) => {
                        const paragraph = document.createElement("p");
                        paragraph.textContent = detail;
                        card.append(paragraph);
                    });
                container.append(card);
            });
        };

        renderCards("announcements-grid", content.announcements, "Announcement");
        renderCards("events-grid", content.events, "Event");

        if (Array.isArray(content.rules)) {
            const rules = document.getElementById("rules-grid");
            if (rules) {
                rules.replaceChildren();
                content.rules.forEach((rule) => {
                    const item = document.createElement("li");
                    item.textContent = typeof rule === "string" ? rule : (rule.text || "");
                    if (item.textContent.trim()) rules.append(item);
                });
            }
        }

        if (Array.isArray(content.birthdays)) {
            const birthdays = document.getElementById("birthdays-grid");
            if (birthdays) {
                birthdays.replaceChildren();
                const today = new Date();
                const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                const upcoming = content.birthdays.map((birthday) => {
                    const match = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(birthday.date || "");
                    if (!match || !birthday.name) return null;
                    const month = Number(match[1]);
                    const day = Number(match[2]);
                    let year = today.getFullYear();
                    let date = new Date(year, month - 1, day);
                    if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
                    if (Date.UTC(year, month - 1, day) < todayUtc) {
                        year += 1;
                        date = new Date(year, month - 1, day);
                        if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
                    }
                    const daysAway = Math.round((Date.UTC(year, month - 1, day) - todayUtc) / 86400000);
                    return { ...birthday, date, daysAway };
                }).filter(Boolean).sort((a, b) => a.daysAway - b.daysAway);

                if (upcoming.length === 0) {
                    const empty = document.createElement("p");
                    empty.className = "card birthday-empty";
                    empty.textContent = "Birthday celebrations will be posted here.";
                    birthdays.append(empty);
                } else {
                    upcoming.forEach((birthday) => {
                        const card = document.createElement("article");
                        card.className = "card birthday-card";
                        const title = document.createElement("h3");
                        title.textContent = `🎂 ${birthday.name}`;
                        card.append(title);
                        const date = document.createElement("p");
                        date.className = "birthday-date";
                        date.textContent = birthday.date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
                        card.append(date);
                        const countdown = document.createElement("p");
                        countdown.className = "birthday-countdown";
                        countdown.textContent = birthday.daysAway === 0 ? "Celebrating today!" :
                            birthday.daysAway === 1 ? "Tomorrow!" : `In ${birthday.daysAway} days`;
                        card.append(countdown);
                        if (birthday.note) {
                            const note = document.createElement("p");
                            note.textContent = birthday.note;
                            card.append(note);
                        }
                        birthdays.append(card);
                    });
                }
            }
        }

        if (Array.isArray(content.gallery)) {
            const photos = content.gallery.filter((photo) => photo.image);
            const spread = document.getElementById("gallery-pages");
            const previous = document.getElementById("gallery-prev");
            const next = document.getElementById("gallery-next");
            const status = document.getElementById("gallery-page-status");

            if (spread && previous && next && status) {
                const photosPerPage = 2;
                const pageCount = Math.ceil(photos.length / photosPerPage);
                let currentPage = 0;

                const showPage = (page) => {
                    currentPage = Math.max(0, Math.min(page, pageCount - 1));
                    spread.replaceChildren();

                    const pagePhotos = photos.slice(currentPage * photosPerPage, (currentPage + 1) * photosPerPage);
                    pagePhotos.forEach((photo) => {
                        const figure = document.createElement("figure");
                        figure.className = "photo-book-page";
                        const image = document.createElement("img");
                        image.src = photo.image;
                        image.alt = photo.alt || "Kozee Lounge memory";
                        image.loading = "lazy";
                        figure.append(image);
                        if (photo.alt) {
                            const caption = document.createElement("figcaption");
                            caption.textContent = photo.alt;
                            figure.append(caption);
                        }
                        spread.append(figure);
                    });

                    spread.classList.remove("page-turn");
                    void spread.offsetWidth;
                    spread.classList.add("page-turn");
                    status.textContent = pageCount ? `Page ${currentPage + 1} of ${pageCount}` : "Page 0 of 0";
                    previous.disabled = currentPage === 0 || pageCount === 0;
                    next.disabled = currentPage >= pageCount - 1 || pageCount === 0;

                    if (pageCount === 0) {
                        const empty = document.createElement("p");
                        empty.className = "photo-book-empty";
                        empty.textContent = "Photos will appear here.";
                        spread.append(empty);
                    }
                };

                previous.addEventListener("click", () => showPage(currentPage - 1));
                next.addEventListener("click", () => showPage(currentPage + 1));
                showPage(0);
            }
        }
    } catch (error) {
        console.error("Could not load editable site content:", error);
    }
}

loadSiteContent();
