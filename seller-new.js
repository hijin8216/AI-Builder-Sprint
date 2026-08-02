const productForm = document.querySelector("#new-product-form");
const productSteps = [...document.querySelectorAll("[data-product-step]")];
const stepIndicators = [...document.querySelectorAll("[data-step-indicator]")];
const previousButton = document.querySelector("#editor-previous");
const nextButton = document.querySelector("#editor-next");
const submitButton = document.querySelector("#editor-submit");
const errorBox = document.querySelector("#new-product-error");
const accountLabel = document.querySelector("#editor-account");
const thumbnailInput = document.querySelector("#thumbnail-image-input");
const detailImagesInput = document.querySelector("#detail-images-input");
const imagePreview = document.querySelector("#seller-image-preview");
const editPathMatch = window.location.pathname.match(/^\/seller\/edit\/([^/]+)$/);
const editingPostId = editPathMatch
  ? decodeURIComponent(editPathMatch[1])
  : "";
let currentStep = 1;
let existingProductImages = {
  thumbnail: "",
  details: [],
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showError(message = "") {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || "요청을 처리하지 못했습니다.");
    error.status = response.status;
    throw error;
  }
  return result;
}

function renderStep() {
  productSteps.forEach((step) => {
    step.hidden = Number(step.dataset.productStep) !== currentStep;
  });
  stepIndicators.forEach((indicator) => {
    const step = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("is-active", step === currentStep);
    indicator.classList.toggle("is-completed", step < currentStep);
  });
  previousButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === productSteps.length;
  submitButton.hidden = currentStep !== productSteps.length;
  showError();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateCurrentStep() {
  const currentSection = productSteps[currentStep - 1];
  const fields = [...currentSection.querySelectorAll("input, select, textarea")];
  const invalidField = fields.find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    return false;
  }

  if (
    currentStep === 3 &&
    !productForm.querySelector('[name="availableDays"]:checked')
  ) {
    showError("이용 가능한 요일을 한 개 이상 선택해 주세요.");
    return false;
  }
  if (
    currentStep === 3 &&
    !productForm.querySelector('[name="languages"]:checked')
  ) {
    showError("지원 언어를 한 개 이상 선택해 주세요.");
    return false;
  }
  return true;
}

function selectedImages() {
  return {
    thumbnail: thumbnailInput.files?.[0] || null,
    details: [...(detailImagesInput.files || [])],
  };
}

function validateImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("사진은 JPG, PNG 또는 WEBP 파일만 선택해 주세요.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("사진 한 장의 크기는 5MB 이하여야 합니다.");
  }
}

function renderImages() {
  const images = selectedImages();
  const items = [
    ...(images.thumbnail
      ? [{ url: URL.createObjectURL(images.thumbnail), label: "대표" }]
      : existingProductImages.thumbnail
        ? [{ url: existingProductImages.thumbnail, label: "기존 대표" }]
        : []),
    ...(images.details.length
      ? images.details.slice(0, 6).map((file, index) => ({
          url: URL.createObjectURL(file),
          label: `상세 ${index + 1}`,
        }))
      : existingProductImages.details.map((url, index) => ({
          url,
          label: `기존 상세 ${index + 1}`,
        }))),
  ];
  imagePreview.innerHTML = items.length
    ? items
        .map(
          ({ url, label }) => `
            <figure>
              <img src="${escapeHtml(url)}" alt="${escapeHtml(label)} 사진 미리보기" />
              <figcaption>${escapeHtml(label)}</figcaption>
            </figure>
          `,
        )
        .join("")
    : "<p>선택한 사진이 여기에 미리 표시됩니다.</p>";
}

async function uploadImage(file) {
  validateImage(file);
  const response = await fetch("/api/seller/uploads", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || "사진을 올리지 못했습니다.");
    error.status = response.status;
    throw error;
  }
  return result.imageUrl;
}

function listFrom(value, separator) {
  return String(value || "")
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createPayload(formData) {
  const payload = Object.fromEntries(formData.entries());
  payload.swimmingRequired = formData.get("swimmingRequired") === "true";
  payload.waiverRequired = formData.has("waiverRequired");
  payload.suitableFor = formData.getAll("suitableFor");
  payload.availableDays = formData.getAll("availableDays");
  payload.languages = formData.getAll("languages");
  payload.moods = listFrom(formData.get("moods"), ",");
  payload.timeSlots = listFrom(formData.get("timeSlots"), ",");
  payload.included = listFrom(formData.get("included"), /\r?\n/);
  payload.safetyNotes = listFrom(formData.get("safetyNotes"), /\r?\n/);
  payload.participantRequirements = listFrom(
    formData.get("participantRequirements"),
    /\r?\n/,
  );
  return payload;
}

function setFieldValue(name, value) {
  const field = productForm.elements.namedItem(name);
  if (field && "value" in field) {
    field.value = value ?? "";
  }
}

function setCheckedValues(name, values = []) {
  const selected = new Set(values);
  productForm
    .querySelectorAll(`[name="${name}"]`)
    .forEach((input) => {
      input.checked = selected.has(input.value);
    });
}

function populateEditForm(post) {
  const scalarFields = [
    "title",
    "partnerName",
    "category",
    "region",
    "location",
    "pricePerPerson",
    "durationMinutes",
    "minAge",
    "maxParticipants",
    "description",
    "difficulty",
    "thrillLevel",
    "physicalIntensity",
    "weatherDependency",
    "refundPolicy",
    "termsAndConditions",
  ];
  scalarFields.forEach((name) => setFieldValue(name, post[name]));
  setFieldValue(
    "swimmingRequired",
    post.swimmingRequired === true ? "true" : "false",
  );
  setFieldValue("moods", (post.moods || []).join(", "));
  setFieldValue("timeSlots", (post.timeSlots || []).join(", "));
  setFieldValue("included", (post.included || []).join("\n"));
  setFieldValue("safetyNotes", (post.safetyNotes || []).join("\n"));
  setFieldValue(
    "participantRequirements",
    (post.participantRequirements || []).join("\n"),
  );
  setCheckedValues("suitableFor", post.suitableFor);
  setCheckedValues("availableDays", post.availableDays);
  setCheckedValues("languages", post.languages);
  productForm.elements.namedItem("waiverRequired").checked =
    post.waiverRequired !== false;

  existingProductImages = {
    thumbnail: post.thumbnailImage || "",
    details: post.detailImages || [],
  };
  renderImages();

  document.querySelector(".product-editor-page").dataset.editorMode = "edit";
  window.SellerLocale?.applyLocale?.();
}

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep += 1;
  renderStep();
});

previousButton.addEventListener("click", () => {
  currentStep -= 1;
  renderStep();
});

thumbnailInput.addEventListener("change", renderImages);
detailImagesInput.addEventListener("change", () => {
  if ((detailImagesInput.files?.length || 0) > 6) {
    showError("상세 사진은 최대 6장까지 선택해 주세요.");
  }
  renderImages();
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  submitButton.disabled = true;
  submitButton.textContent = "상품과 사진 저장 중…";
  showError();

  try {
    const images = selectedImages();
    if (images.details.length > 6) {
      throw new Error("상세 사진은 최대 6장까지 선택해 주세요.");
    }
    const payload = createPayload(new FormData(productForm));
    const [thumbnailImage, detailImages] = await Promise.all([
      images.thumbnail
        ? uploadImage(images.thumbnail)
        : existingProductImages.thumbnail,
      images.details.length
        ? Promise.all(images.details.map(uploadImage))
        : existingProductImages.details,
    ]);
    payload.thumbnailImage = thumbnailImage;
    payload.detailImages = detailImages;

    await requestJson(
      editingPostId
        ? `/api/seller/posts/${encodeURIComponent(editingPostId)}`
        : "/api/seller/posts",
      {
      method: editingPostId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
      },
    );
    window.location.href = editingPostId
      ? "/seller?updated=1"
      : "/seller?created=1";
  } catch (error) {
    if (error.status === 401) {
      window.location.href = "/seller";
      return;
    }
    showError(error.message);
  } finally {
    submitButton.disabled = false;
    window.SellerLocale?.applyLocale?.();
  }
});

requestJson("/api/seller/overview")
  .then((result) => {
    accountLabel.textContent = `${result.user.userId} · ${result.user.email}`;
    if (editingPostId) {
      const post = result.posts.find((item) => item.id === editingPostId);
      if (!post) {
        showError("수정할 판매 상품을 찾지 못했습니다.");
        productForm.hidden = true;
        return;
      }
      populateEditForm(post);
    }
  })
  .catch(() => {
    window.location.href = "/seller";
  });

renderStep();
