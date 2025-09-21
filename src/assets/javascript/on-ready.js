$(() => {
  BootstrapInitializer.initialize();

  // const dataLoader = new DataLoader();
  // dataLoader.loadData();

  // const refreshRateManager = new RefreshRateManager();
  // refreshRateManager.initialize();

  // const timeframeManager = new TimeframeManager();
  // timeframeManager.initialize();

  // const autocomplete = new AutocompleteLoader();
  // autocomplete.initialize();

  // FoodSearchLoader.initialize();

  // const unitDropdown = new UnitDropdownInitializer();
  // unitDropdown.initialize();

});

class BootstrapInitializer {
  static initialize() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }
}
