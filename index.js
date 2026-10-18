/* ---------- Mobile menu ---------- */
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const scrim = document.getElementById("scrim");

function setMenu(open) {
    nav.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
scrim.addEventListener("click", () => setMenu(false));
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ---------- Listings ---------- */
const TYPES = [
    {
        id: "townhouse", title: "Townhouse", prefix: "th",
        desc: "Narrow, multi-level homes that share walls with neighboring units, balancing privacy with community living.",
        items: [["$70k", "$800"], ["$70k", "$800"], ["$70k", "$800"], ["$70k", "$800"], ["$70k", "$800"], ["$70k", "$800"]]
    },
    {
        id: "victorian", title: "Victorian", prefix: "victorian",
        desc: "Elaborate details, steep roofs, asymmetrical facades and ornate decoration from the Victorian era.",
        items: [["$300k"], ["$550k"], ["$285k"], ["$190k"], ["$450k"], ["$320k"]]
    },
    {
        id: "condominium", title: "Condominium", prefix: "condo",
        desc: "Individually owned units within a larger complex, with amenities and shared costs through a homeowners' association.",
        items: [["$80k", "$700"], ["$77k", "$720"], ["$62k", "$580"], ["$65k", "$600"], ["$50k", "$450"], ["$105k", "$800"]]
    },
    {
        id: "villa", title: "Villa", prefix: "villa",
        desc: "Expansive, elegant residences in desirable locations, with luxurious amenities and refined living.",
        items: [["$320k"], ["$225k"], ["$280k"], ["$450k"], ["$350k"], ["$190k"]]
    }
];

const state = { type: "all", mode: "buy" };
const saved = new Set();
const listingsEl = document.getElementById("listings");
const savedCount = document.getElementById("savedCount");
const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.800 3.300 4.500 6.600 4.500c2 0 3.600 1.100 5.400 3.100 1.800-2 3.400-3.100 5.400-3.100 3.300 0 5.100 3.300 3.900 6.600-1.800 4.800-9.300 9.400-9.300 9.400z"/></svg>';

function priceMarkup(item) {
    const [buy, rent] = item;
    if (state.mode === "rent") {
        return `<strong>${rent}/mo</strong><span>Buy ${buy}</span>`;
    }
    return `<strong>${buy}</strong>` + (rent ? `<span>Rent ${rent}/mo</span>` : "");
}

function renderListings() {
    let visibleGroups = 0;
    const html = TYPES.map(t => {
        if (state.type !== "all" && state.type !== t.id) return "";
        const rows = t.items
            .map((item, i) => ({ item, i }))
            .filter(({ item }) => state.mode === "buy" || item[1]);
        if (!rows.length) return "";
        visibleGroups++;
        const cards = rows.map(({ item, i }) => {
            const id = `${t.id}-${i + 1}`;
            const on = saved.has(id);
            return `
            <article class="listing">
                <div class="frame"><img src="images/${t.prefix}${i + 1}.jpg" alt="${t.title} listing ${i + 1}" loading="lazy"></div>
                <button class="save" data-id="${id}" aria-pressed="${on}" aria-label="Save ${t.title} listing ${i + 1}">${heart}</button>
                <div class="listing-bar"><h4>${t.title}</h4><div class="price">${priceMarkup(item)}</div></div>
            </article>`;
        }).join("");
        return `
        <div class="group" id="${t.id}">
            <div class="group-head">
                <h3>${t.title}<small>${rows.length} ${rows.length === 1 ? "listing" : "listings"}</small></h3>
                <p>${t.desc}</p>
            </div>
            <div class="masonry">${cards}</div>
        </div>`;
    }).join("");

    listingsEl.innerHTML = html || `<p class="empty">No ${state.mode === "rent" ? "rentals" : "listings"} in this category right now. Try Buy or another property type.</p>`;
}

function syncControls() {
    document.querySelectorAll("#chips .chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.type === state.type)));
    document.querySelectorAll('input[name="mode"], input[name="mode2"]').forEach(r => { r.checked = r.value === state.mode; });
    document.getElementById("finderType").value = state.type;
}

function update() {
    syncControls();
    renderListings();
}

function goToProperties() {
    document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("chips").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.type = chip.dataset.type;
    update();
});

document.querySelectorAll('input[name="mode2"]').forEach(r => r.addEventListener("change", () => {
    state.mode = r.value;
    update();
}));

document.getElementById("finder").addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.target);
    state.mode = data.get("mode");
    state.type = data.get("type");
    update();
    goToProperties();
});

document.querySelectorAll(".type").forEach(tile => tile.addEventListener("click", e => {
    e.preventDefault();
    state.type = tile.dataset.type;
    update();
    goToProperties();
}));

listingsEl.addEventListener("click", e => {
    const btn = e.target.closest(".save");
    if (!btn) return;
    const id = btn.dataset.id;
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    btn.setAttribute("aria-pressed", String(saved.has(id)));
    savedCount.textContent = `${saved.size} saved`;
});

update();

/* ---------- Drag rails (agents, testimonials) ---------- */
function enableDrag(rail) {
    let down = false, moved = false, startX = 0, startScroll = 0;

    rail.addEventListener("pointerdown", e => {
        if (e.pointerType !== "mouse") return;
        down = true;
        moved = false;
        startX = e.clientX;
        startScroll = rail.scrollLeft;
    });

    window.addEventListener("pointermove", e => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 5) {
            moved = true;
            rail.classList.add("dragging");
        }
        if (moved) rail.scrollLeft = startScroll - dx;
    });

    window.addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        rail.classList.remove("dragging");
    });

    rail.addEventListener("click", e => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
}

document.querySelectorAll(".rail").forEach(enableDrag);

document.querySelectorAll("[data-rail]").forEach(btn => btn.addEventListener("click", () => {
    const rail = document.getElementById(btn.dataset.rail);
    const card = rail.firstElementChild;
    const step = card.getBoundingClientRect().width + 16;
    rail.scrollBy({ left: step * Number(btn.dataset.dir), behavior: "smooth" });
}));

/* ---------- Stat counters ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countUp(el) {
    const to = parseFloat(el.dataset.to);
    const dec = Number(el.dataset.dec || 0);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) return;
    const start = performance.now();
    const duration = 1400;
    function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (to * eased).toFixed(dec) + suffix;
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
    });
}, { threshold: 0.6 });

document.querySelectorAll(".stat strong").forEach(el => statObserver.observe(el));

/* ---------- Contact form ---------- */
const scriptURL = "https://script.google.com/macros/s/AKfycbzKbs5VdrvqywxxqGAPRspQA3fVpKZ735wccGhKdJgqcTmzQxMVzXUWcieqbrxDQbenVA/exec";
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");
let statusTimer;

function showStatus(text) {
    statusEl.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.textContent = ""; }, 5000);
}

form.addEventListener("submit", e => {
    e.preventDefault();
    sendBtn.disabled = true;
    fetch(scriptURL, { method: "POST", body: new FormData(form) })
        .then(() => {
            showStatus("Thanks, we got your message and will reply soon.");
            form.reset();
        })
        .catch(() => showStatus("Could not send. Check your connection and try again."))
        .finally(() => { sendBtn.disabled = false; });
});