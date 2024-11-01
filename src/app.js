const apiUrl = 'https://restcountries.com/v3.1/all';

let allCountries = []; // Global array to store all country data
let itinerary = [];
let selectedCountry = null;
let isEditing = false;
let editIndex = null;

// Fetch and display countries
async function fetchCountries() {
    const response = await fetch(apiUrl);
    allCountries = await response.json(); // Store all countries
    displayCountries(allCountries);
}

// Display country list
function displayCountries(countries) {
    const countryList = document.getElementById('country-list');
    countryList.innerHTML = '';
    countries.forEach(country => {
        const countryItem = document.createElement('div');
        countryItem.className = 'country-item';
        countryItem.innerHTML = `
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" class="country-flag">
            <h3>${country.name.common}</h3>
        `;
        countryItem.onclick = () => showCountryInfo(country);
        countryList.appendChild(countryItem);
    });
}

// Show selected country details
function showCountryInfo(country) {
    document.getElementById('country-name').textContent = country.name.common;
    document.getElementById('country-capital').textContent = country.capital ? country.capital[0] : 'N/A';
    document.getElementById('country-language').textContent = Object.values(country.languages).join(', ');
    document.getElementById('country-population').textContent = country.population.toLocaleString();
    document.getElementById('country-area').textContent = country.area;
    document.getElementById('country-region').textContent = country.region;
    document.getElementById('country-subregion').textContent = country.subregion;
    document.getElementById('country-timezone').textContent = country.timezones.join(', ');
    document.getElementById('country-flag').src = country.flags.svg;

    // Display coat of arms or "NONE" text 
    const coatOfArmsImage = document.getElementById('country-coat-of-arms');
    const coatOfArmsText = document.getElementById('coat-of-arms-text');

    if (country.coatOfArms?.svg) {
        coatOfArmsImage.src = country.coatOfArms.svg;
        coatOfArmsImage.style.display = 'block';
        coatOfArmsText.style.display = 'none'; // Hide "NOT HAVE" text
    } else {
        coatOfArmsImage.style.display = 'none'; // Hide image
        coatOfArmsText.style.display = 'block'; // Show "NOT HAVE" text
    }

    // Google Maps link for the country
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.name.common)}`;
    document.getElementById('country-maps').href = googleMapsLink;
    document.getElementById('country-maps').textContent = `View on Google Maps`;

    // Set search input to the selected country's name
    const searchInput = document.getElementById('search');
    searchInput.value = country.name.common;

    // Perform search to display only the selected country
    searchCountry();

    // Display nearby countries 
    displayNearbyCountries(country.subregion, country.name.common);

    // Update to itinerary
    const countryInfo = document.getElementById('country-info');
    const existingButton = document.getElementById('add-to-itinerary-btn');
    if (existingButton) existingButton.remove();

    const addButton = document.createElement('button');
    addButton.id = 'add-to-itinerary-btn';
    addButton.className = 'action-button btn-primary';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Add to Itinerary';
    addButton.onclick = () => addToItinerary(country);
    countryInfo.appendChild(addButton);
}

// Display nearby countries within the same subregion
function displayNearbyCountries(subregion, currentCountryName) {
    const nearbyCountriesList = document.getElementById('nearby-countries');
    nearbyCountriesList.innerHTML = '';

    // Filter countries in the same subregion, excluding the current country
    const nearbyCountries = allCountries.filter(
        country => country.subregion === subregion && country.name.common !== currentCountryName
    );

    // Display names of nearby countries
    if (nearbyCountries.length > 0) {
        nearbyCountries.forEach(country => {
            const countryItem = document.createElement('li');
            countryItem.textContent = country.name.common;
            nearbyCountriesList.appendChild(countryItem);
        });
    } else {
        nearbyCountriesList.innerHTML = '<li>No nearby countries found</li>';
    }
}

// Search for countries in the list
function searchCountry() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const countryItems = document.getElementsByClassName('country-item');
    Array.from(countryItems).forEach(item => {
        const countryName = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = countryName.includes(searchTerm) ? 'block' : 'none';
    });
}

// Add selected country to itinerary
function addToItinerary(country) {
    selectedCountry = country;
    isEditing = false;
    document.getElementById('modal-country-name').textContent = country.name.common;
    openModal();
}

// Open add details modal
function openModal() {
    document.getElementById('add-details-modal').style.display = 'block';
}

// close add details modal
function closeModal() {
    document.getElementById('add-details-modal').style.display = 'none';
    clearModalFields();
}

// Clear modal fields after closing
function clearModalFields() {
    document.getElementById('location').value = '';
    document.getElementById('activities').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
}

// Save details to itinerary
function saveItineraryDetails() {
    const location = document.getElementById('location').value;
    const activities = document.getElementById('activities').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    if (isEditing) {
        itinerary[editIndex] = { country: selectedCountry, location, activities, description, date };
    } else {
        if (itinerary.some(item => item.country.name.common === selectedCountry.name.common)) {
            alert("This country is already in your itinerary.");
            closeModal();
            return;
        }
        itinerary.push({ country: selectedCountry, location, activities, description, date });
    }

    displayItinerary();
    saveItineraryToLocalStorage();
    closeModal();
    isEditing = false;
    editIndex = null;
}

// Display itinerary list with options
function displayItinerary() {
    const itineraryList = document.getElementById('itinerary-list');
    itineraryList.innerHTML = '';

    itinerary.forEach((item, index) => {
        const itineraryItem = document.createElement('li');
        itineraryItem.classList.add('itinerary-item');

        itineraryItem.innerHTML = `
            <div class="divide2">
                <div class="itinerary-details">
                    <div class="country-header">
                        <img src="${item.country.flags.svg}" alt="Flag of ${item.country.name.common}" class="itinerary-flag">
                        <span><strong>${item.country.name.common}</strong></span>
                    </div>
                    <span><strong>Location:</strong> ${item.location}</span>
                    <span><strong>Activities:</strong> ${item.activities}</span>
                    <span><strong>Description:</strong> ${item.description}</span>
                    <span><strong>Date:</strong> ${item.date}</span>
                </div>
                <div class="itinerary-actions">
                    <button class="itinerary-btn remove-btn" onclick="removeFromItinerary(${index})">Remove</button>
                    <button class="itinerary-btn edit-btn" onclick="editItineraryItem(${index})">Edit</button>
                    <button class="itinerary-btn save-btn" onclick="saveItineraryToFile(${index})">Save</button>
                </div>
            </div>
        `;
        itineraryList.appendChild(itineraryItem);
    });

    updateItineraryCount();
}

// Save itinerary to a text file
function saveItineraryToFile(index) {
    const item = itinerary[index];
    const itineraryText = 
`Country: ${item.country.name.common}
Location: ${item.location}
Activities: ${item.activities}
Description: ${item.description}
Date: ${item.date}`;

    const blob = new Blob([itineraryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.country.name.common} Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Remove item from itinerary
function removeFromItinerary(index) {
    itinerary.splice(index, 1);
    displayItinerary();
    saveItineraryToLocalStorage();
    updateItineraryCount();
}

// Edit existing itinerary item
function editItineraryItem(index) {
    isEditing = true;
    editIndex = index;
    selectedCountry = itinerary[index].country;

    document.getElementById('modal-country-name').textContent = selectedCountry.name.common;
    document.getElementById('location').value = itinerary[index].location;
    document.getElementById('activities').value = itinerary[index].activities;
    document.getElementById('description').value = itinerary[index].description;
    document.getElementById('date').value = itinerary[index].date;

    openModal();
}

function clearItinerary() {
    itinerary = [];
    displayItinerary();
    saveItineraryToLocalStorage();
    updateItineraryCount();
}

// Save itinerary to local storage
function saveItineraryToLocalStorage() {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
}

// load from local storage
function loadItineraryFromLocalStorage() {
    const savedItinerary = localStorage.getItem('itinerary');
    if (savedItinerary) {
        itinerary = JSON.parse(savedItinerary);
        displayItinerary();
    }
}

// Load itinerary from localStorage on page load
window.onload = loadItineraryFromLocalStorage;
fetchCountries();

function updateItineraryCount() {
    const count = itinerary.length;
    const countText = count === 1 ? '1 destination' : `${count} destinations`;
    document.getElementById('itinerary-count').textContent = countText;
}
