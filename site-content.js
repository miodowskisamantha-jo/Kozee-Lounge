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

        if (Array.isArray(content.announcements)) {
            const announcements = document.getElementById("announcements-grid");
            announcements.replaceChildren();
            content.announcements.forEach((announcement) => {
                const card = document.createElement("div");
                card.className = "card";
                const title = document.createElement("h3");
                title.textContent = announcement.title || "Announcement";
                card.append(title);
                (Array.isArray(announcement.details) ? announcement.details : [announcement.details])
                    .filter(Boolean)
                    .forEach((detail) => {
                        const paragraph = document.createElement("p");
                        paragraph.textContent = detail;
                        card.append(paragraph);
                    });
                announcements.append(card);
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

        if (Array.isArray(content.birthdays)) {
            const birthdays = document.getElementById("birthdays-grid");
            birthdays.replaceChildren();
            const today = new Date();
            const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
            const upcoming = content.birthdays
                .map((birthday) => {
                    const match = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(birthday.date || "");
                    if (!match || !birthday.name) return null;
                    const month = Number(match[1]);
                    const day = Number(match[2]);
                    const currentYear = today.getFullYear();
                    let year = currentYear;
                    let nextDate = new Date(year, month - 1, day);
                    if (nextDate.getMonth() !== month - 1 || nextDate.getDate() !== day) return null;
                    if (Date.UTC(year, month - 1, day) < todayUtc) {
                        year += 1;
                        nextDate = new Date(year, month - 1, day);
                        if (nextDate.getMonth() !== month - 1 || nextDate.getDate() !== day) return null;
                    }
                    const daysAway = Math.round((Date.UTC(year, month - 1, day) - todayUtc) / 86400000);
                    return { ...birthday, nextDate, daysAway };
                })
                .filter(Boolean)
                .sort((a, b) => a.daysAway - b.daysAway);

            if (upcoming.length === 0) {
                const empty = document.createElement("p");
                empty.className = "birthday-empty";
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
                    date.textContent = birthday.nextDate.toLocaleDateString(undefined, { month: "long", day: "numeric" });
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
        console.error("Could not load editable site content:", error);
    }
}

loadSiteContent();
