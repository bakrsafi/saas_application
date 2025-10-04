  const nameInput = document.getElementById("nameFilter");
  const citySelect = document.getElementById("cityFilter");
  const cards = document.querySelectorAll(".property-card");
  const noResults = document.getElementById("noResults");

  function filterCards() {
    const nameValue = nameInput.value.toLowerCase();
    const cityValue = citySelect.value;
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector(".SearchText").textContent.toLowerCase();
      const location = card.querySelector(".property-location").textContent;

      const matchName = title.includes(nameValue);
      const matchCity = cityValue === "" || location.includes(cityValue);

      const show = matchName && matchCity;
      card.style.display = show ? "block" : "none";
      if (show) visibleCount++;
    });

    // ✅ إظهار أو إخفاء الرسالة
    noResults.style.display = visibleCount === 0 ? "block" : "none";
  }

  nameInput.addEventListener("input", filterCards);
  citySelect.addEventListener("change", filterCards);