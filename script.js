let experiences = [];

const state = {
  category: "",
  region: "",
  keyword: "",
  sort: "popular",
  selectedExperience: null,
  favorites: new Set(),
  recommendedIds: null,
  recommendationMap: new Map(),
  recommendationMessage: "",
};

const categoryGroups = {
  "": [],
  요트: ["요트", "크루즈"],
  서핑: ["서핑", "바디보드"],
  다이빙: ["다이빙", "스노클링", "프리다이빙"],
  SUP: ["SUP", "카약"],
  낚시: ["낚시"],
};

const categoryImages = {
  요트: [
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=86",
    "https://images.unsplash.com/photo-1562281302-809108fd533c?auto=format&fit=crop&w=900&q=86",
  ],
  크루즈: [
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=900&q=86",
  ],
  서핑: [
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=86",
    "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=900&q=86",
  ],
  바디보드: [
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=86",
  ],
  다이빙: [
    "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=900&q=86",
  ],
  스노클링: [
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=900&q=86",
  ],
  프리다이빙: [
    "https://images.unsplash.com/photo-1530130270670-4c1bfa14390b?auto=format&fit=crop&w=900&q=86",
  ],
  SUP: [
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=86",
  ],
  카약: [
    "https://images.unsplash.com/photo-1521120413309-42e7eada0334?auto=format&fit=crop&w=900&q=86",
  ],
  낚시: [
    "https://images.unsplash.com/photo-1510137600163-2729bc695e3a?auto=format&fit=crop&w=900&q=86",
  ],
  제트스키: [
    "https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=900&q=86",
  ],
  바나나보트: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=86",
  ],
  웨이크보드: [
    "https://images.unsplash.com/photo-1528150177508-7cc0c36cda5c?auto=format&fit=crop&w=900&q=86",
  ],
};

const experienceGrid = document.querySelector("#experience-grid");
const emptyState = document.querySelector("#empty-state");
const resultCount = document.querySelector("#result-count");
const resultDescription = document.querySelector("#result-description");
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const regionSelect = document.querySelector("#region-select");
const keywordInput = document.querySelector("#keyword-input");
const sortSelect = document.querySelector("#sort-select");
const bookingDialog = document.querySelector("#booking-dialog");
const bookingDate = document.querySelector("#booking-date");
const searchDate = document.querySelector("#search-date");
const recommendationDialog = document.querySelector("#recommendation-dialog");
const recommendationError = document.querySelector("#recommendation-error");
const recommendationSubmit = document.querySelector("#recommendation-submit");
const toast = document.querySelector("#toast");

let toastTimer;

function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryMatches(productCategory, selectedCategory) {
  if (!selectedCategory) return true;
  const groupedCategories = categoryGroups[selectedCategory] ?? [selectedCategory];
  return groupedCategories.includes(productCategory);
}

function getProductImage(product) {
  const images = categoryImages[product.category] ?? categoryImages.요트;
  const numericId = Number(product.id.replace(/\D/g, "")) || 0;
  return images[numericId % images.length];
}

function getVisibleExperiences() {
  if (state.recommendedIds) {
    const experienceMap = new Map(
      experiences.map((experience) => [experience.id, experience]),
    );

    return state.recommendedIds
      .map((id) => experienceMap.get(id))
      .filter(Boolean);
  }

  const normalizedKeyword = state.keyword.trim().toLowerCase();

  const filtered = experiences.filter((experience) => {
    const matchesCategory = categoryMatches(
      experience.category,
      state.category,
    );
    const matchesRegion = !state.region || experience.region === state.region;
    const searchableText =
      `${experience.partnerName} ${experience.name} ${experience.description} ${experience.category} ${experience.region} ${experience.moods.join(" ")}`.toLowerCase();
    const matchesKeyword =
      !normalizedKeyword || searchableText.includes(normalizedKeyword);

    return matchesCategory && matchesRegion && matchesKeyword;
  });

  return [...filtered].sort((first, second) => {
    if (state.sort === "rating") {
      return second.rating - first.rating || second.reviewCount - first.reviewCount;
    }

    if (state.sort === "low-price") {
      return first.pricePerPerson - second.pricePerPerson;
    }

    return second.reviewCount - first.reviewCount;
  });
}

function renderExperiences() {
  const visibleExperiences = getVisibleExperiences();

  experienceGrid.innerHTML = visibleExperiences
    .map((experience) => {
      const recommendation = state.recommendationMap.get(experience.id);
      const recommendationNote = recommendation
        ? `
          <div class="recommendation-note">
            <strong>✦ AI 추천 이유 · 적합도 ${recommendation.score}점</strong>
            ${escapeHtml(recommendation.reason)}
            <span class="recommendation-tags">
              ${recommendation.fitPoints
                .map((point) => `<span>${escapeHtml(point)}</span>`)
                .join("")}
            </span>
            <span class="recommendation-caution">주의: ${escapeHtml(recommendation.caution)}</span>
          </div>
        `
        : "";

      return `
        <article class="experience-card">
          <div class="card-image">
            <img
              src="${getProductImage(experience)}"
              alt="${escapeHtml(experience.name)}"
              loading="lazy"
            />
            <span class="card-badge">${experience.rating >= 4.9 ? "BEST" : "AVAILABLE"}</span>
            <button
              class="favorite-button ${state.favorites.has(experience.id) ? "is-active" : ""}"
              type="button"
              data-favorite="${experience.id}"
              aria-label="${escapeHtml(experience.name)} 찜하기"
              aria-pressed="${state.favorites.has(experience.id)}"
            >${state.favorites.has(experience.id) ? "♥" : "♡"}</button>
          </div>
          <button class="card-button" type="button" data-booking="${experience.id}">
            <span class="card-meta">
              <span>${escapeHtml(experience.region)} · ${escapeHtml(experience.category)}</span>
              <span class="card-rating">★ ${experience.rating} (${experience.reviewCount})</span>
            </span>
            <h3>${escapeHtml(experience.name)}</h3>
            <span class="card-footer">
              <span>${escapeHtml(experience.partnerName)} · ${experience.durationMinutes}분</span>
              <strong>${formatPrice(experience.pricePerPerson)}</strong>
            </span>
          </button>
          ${recommendationNote}
        </article>
      `;
    })
    .join("");

  resultCount.textContent = `${visibleExperiences.length}개의 경험`;
  emptyState.hidden = visibleExperiences.length !== 0;

  if (state.recommendedIds) {
    resultDescription.textContent = state.recommendationMessage;
    return;
  }

  const descriptions = [];
  if (state.category) descriptions.push(`${state.category} 카테고리`);
  if (state.region) descriptions.push(`${state.region} 지역`);
  if (state.keyword) descriptions.push(`“${state.keyword}” 검색`);

  resultDescription.textContent = descriptions.length
    ? `${descriptions.join(" · ")} 결과입니다.`
    : "이번 주 여행자들이 가장 많이 선택한 해양레저예요.";
}

function updateCategoryCounts() {
  categoryButtons.forEach((button) => {
    const category = button.dataset.category;
    const count = experiences.filter((experience) =>
      categoryMatches(experience.category, category),
    ).length;
    const countLabel = button.querySelector("small");

    if (countLabel) countLabel.textContent = `${count} experiences`;
  });
}

function clearRecommendations() {
  state.recommendedIds = null;
  state.recommendationMap.clear();
  state.recommendationMessage = "";
}

function setCategory(category) {
  clearRecommendations();
  state.category = category;

  categoryButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === category);
  });

  renderExperiences();
  document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function openBooking(experienceId) {
  const selectedExperience = experiences.find(
    (experience) => experience.id === experienceId,
  );

  if (!selectedExperience) return;

  state.selectedExperience = selectedExperience;
  document.querySelector("#dialog-image").src =
    getProductImage(selectedExperience);
  document.querySelector("#dialog-image").alt = selectedExperience.name;
  document.querySelector("#dialog-title").textContent = selectedExperience.name;
  document.querySelector("#dialog-location").textContent =
    `${selectedExperience.region} · ${selectedExperience.partnerName} · ${selectedExperience.durationMinutes}분`;
  document.querySelector("#dialog-price").textContent = formatPrice(
    selectedExperience.pricePerPerson,
  );

  bookingDate.value = searchDate.value;
  bookingDialog.showModal();
  document.body.classList.add("dialog-open");
}

async function loadProducts() {
  try {
    const response = await fetch("/data/products.json");
    if (!response.ok) throw new Error("상품 데이터를 불러오지 못했습니다.");

    const data = await response.json();
    experiences = data.products;
    updateCategoryCounts();
    renderExperiences();
  } catch (error) {
    resultCount.textContent = "불러오기 실패";
    resultDescription.textContent = error.message;
    emptyState.hidden = false;
  }
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.category);
  });
});

document.querySelectorAll("[data-region]").forEach((button) => {
  button.addEventListener("click", () => {
    clearRecommendations();
    state.region = button.dataset.region;
    regionSelect.value = state.region;
    renderExperiences();
    document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearRecommendations();
  state.region = regionSelect.value;
  state.keyword = keywordInput.value;
  renderExperiences();
  document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderExperiences();
});

experienceGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const bookingButton = event.target.closest("[data-booking]");

  if (favoriteButton) {
    const experienceId = favoriteButton.dataset.favorite;
    const isFavorite = state.favorites.has(experienceId);

    if (isFavorite) {
      state.favorites.delete(experienceId);
      showToast("찜 목록에서 제외했어요.");
    } else {
      state.favorites.add(experienceId);
      showToast("찜 목록에 담았어요.");
    }

    renderExperiences();
  }

  if (bookingButton) {
    openBooking(bookingButton.dataset.booking);
  }
});

document.querySelectorAll("[data-notice]").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.dataset.notice);
  });
});

document.querySelector("#open-recommendation").addEventListener("click", () => {
  recommendationError.hidden = true;
  recommendationDialog.showModal();
  document.body.classList.add("dialog-open");
});

document.querySelector(".recommendation-close").addEventListener("click", () => {
  recommendationDialog.close();
});

recommendationDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

recommendationDialog.addEventListener("click", (event) => {
  if (event.target === recommendationDialog) recommendationDialog.close();
});

document
  .querySelector("#recommendation-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    recommendationError.hidden = true;
    recommendationSubmit.disabled = true;
    recommendationSubmit.querySelector("span").textContent = "추천을 찾는 중...";

    const profile = {
      budget: Number(document.querySelector("#recommend-budget").value),
      age: Number(document.querySelector("#recommend-age").value),
      region: document.querySelector("#recommend-region").value,
      category: document.querySelector("#recommend-category").value,
      experienceLevel: document.querySelector("#recommend-level").value,
      canSwim: document.querySelector("#recommend-swimming").value === "true",
      companion: document.querySelector("#recommend-companion").value,
      mood: document.querySelector("#recommend-mood").value,
    };

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "추천 결과를 불러오지 못했습니다.");
      }

      state.recommendedIds = result.recommendations.map(
        (recommendation) => recommendation.product.id,
      );
      state.recommendationMap = new Map(
        result.recommendations.map((recommendation) => [
          recommendation.product.id,
          recommendation,
        ]),
      );
      state.recommendationMessage = result.message;
      state.category = "";
      state.region = "";
      state.keyword = "";
      regionSelect.value = "";
      keywordInput.value = "";

      categoryButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.category === "");
      });

      recommendationDialog.close();
      renderExperiences();
      document.querySelector("#experiences").scrollIntoView({ behavior: "smooth" });
      showToast(
        result.mode === "solar"
          ? "Solar가 맞춤 추천을 완성했어요."
          : "상품 점수로 추천했어요. Solar 연결 상태를 확인해주세요.",
      );
    } catch (error) {
      recommendationError.textContent = error.message;
      recommendationError.hidden = false;
    } finally {
      recommendationSubmit.disabled = false;
      recommendationSubmit.querySelector("span").textContent = "AI 추천 받기";
    }
  });

document.querySelector(".dialog-close").addEventListener("click", () => {
  bookingDialog.close();
});

bookingDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const people = document.querySelector("#booking-people").value;
  const experienceTitle = state.selectedExperience?.name ?? "선택한 경험";

  bookingDialog.close();
  showToast(
    `${experienceTitle} · ${bookingDate.value} · ${people}명 예약 요청이 접수됐어요.`,
  );
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.querySelector("#newsletter-email");

  showToast(`${emailInput.value}로 바다 소식을 보내드릴게요.`);
  emailInput.value = "";
});

const menuButton = document.querySelector(".menu-button");
const mainNavigation = document.querySelector("#main-navigation");

menuButton.addEventListener("click", () => {
  const isOpen = mainNavigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

mainNavigation.addEventListener("click", (event) => {
  if (event.target.closest("a, button")) {
    mainNavigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "메뉴 열기");
  }
});

const localToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

searchDate.min = localToday;
bookingDate.min = localToday;

loadProducts();
