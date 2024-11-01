// Load the itinerary data from localStorage when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadItinerary();
});

// Function to load and display the itinerary items from localStorage
function loadItinerary() {
    const itineraryList = document.getElementById('itinerary-list');
    const storedItinerary = JSON.parse(localStorage.getItem('itinerary')) || [];

    itineraryList.innerHTML = ''; // Clear previous items
    storedItinerary.forEach((item, index) => {
        // Create a card for each itinerary item
        const itineraryItem = document.createElement('div');
        itineraryItem.classList.add('card0');
        itineraryItem.innerHTML = `
            <div class="cardcombine">
                <div class="card1">
                    <img src="${item.country.flags.svg}" alt="Flag of ${item.country.name.common}">
                    <h3>${item.country.name.common}</h3>
                </div>
                
                <div class="card2">
                    <div class="content-wrapper">
                        <div class="info-flex">
                            <div class="country-info-section">
                                <h4><i class="fas fa-globe"></i> Country Information</h4>
                                <div class="info-columns">
                                    <div class="info-column">
                                        <p>
                                            <i class="fas fa-city"></i>
                                            <span><strong>Capital:</strong> ${item.country.capital || 'N/A'}</span>
                                        </p>
                                        <p>
                                            <i class="fas fa-language"></i>
                                            <span><strong>Language:</strong> ${Object.values(item.country.languages || {}).join(', ') || 'N/A'}</span>
                                        </p>
                                        <p>
                                            <i class="fas fa-users"></i>
                                            <span><strong>Population:</strong> ${item.country.population.toLocaleString()}</span>
                                        </p>
                                        <p>
                                            <i class="fas fa-map"></i>
                                            <span><strong>Area:</strong> ${item.country.area.toLocaleString()} km²</span>
                                        </p>
                                    </div>
                                    <div class="info-column">
                                        <p>
                                            <i class="fas fa-globe-americas"></i>
                                            <span><strong>Region:</strong> ${item.country.region}</span>
                                        </p>
                                        <p>
                                            <i class="fas fa-map-marker-alt"></i>
                                            <span><strong>Subregion:</strong> ${item.country.subregion}</span>
                                        </p>
                                        <p>
                                            <i class="fas fa-clock"></i>
                                            <span><strong>Timezone:</strong> ${item.country.timezones[0]}</span>
                                        </p>
                                        <p>
                                            <i class="fas fa-map-marked-alt"></i>
                                            <span><strong>Maps:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.country.name.common)}" target="_blank">View on Maps</a></span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="nearby-countries-section">
                                <h4><i class="fas fa-compass"></i> Nearby Countries</h4>
                                <div id="subregion-countries-${index}" class="nearby-countries-grid">
                                    <p>Loading nearby countries...</p>
                                </div>
                            </div>
                        </div>

                        <div class="travel-details-section">
                            <h4><i class="fas fa-suitcase"></i> Travel Details</h4>
                            <p>
                                <i class="fas fa-map-marker-alt"></i>
                                <span><strong>Location:</strong> ${item.location}</span>
                            </p>
                            <p>
                                <i class="fas fa-hiking"></i>
                                <span><strong>Activities:</strong> ${item.activities}</span>
                            </p>
                            <p>
                                <i class="fas fa-sticky-note"></i>
                                <span><strong>Description:</strong> ${item.description}</span>
                            </p>
                            <p>
                                <i class="fas fa-calendar"></i>
                                <span><strong>Date:</strong> ${item.date}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card4">
                    <button class="itinerary-btn edit-btn" onclick="editItinerary(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="itinerary-btn remove-btn" onclick="removeItinerary(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                    <button class="itinerary-btn save-btn" onclick="saveItineraryToFile(${index})">
                        <i class="fas fa-download"></i> Save
                    </button>
                </div>
            </div>
        `;
        itineraryList.appendChild(itineraryItem);
        
        // Load nearby countries for the current itinerary item
        fetchSubregionCountries(item.country.subregion, index, item.country.name.common);
    });
}

// Generate a link to Google Maps for a specific country
function generateGoogleMapsLink(countryName) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(countryName)}`;
}

// Fetch and display nearby countries in the same subregion
function fetchSubregionCountries(subregion, index, currentCountry) {
    fetch(`https://restcountries.com/v3.1/subregion/${subregion}`)
        .then(response => response.json())
        .then(countries => {
            const subregionCountriesDiv = document.getElementById(`subregion-countries-${index}`);
            subregionCountriesDiv.innerHTML = `<p><strong>Nearby Countries</strong></p>`;
            
            countries.forEach(country => {
                if (country.name.common !== currentCountry) { // Avoid showing the same country
                    const countryItem = document.createElement('p');
                    countryItem.textContent = country.name.common;
                    subregionCountriesDiv.appendChild(countryItem);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching subregion countries:', error);
            document.getElementById(`subregion-countries-${index}`).innerHTML = "<p>Error loading subregion countries.</p>";
        });
}


let editIndex = null; // Global variable to store the index of the item being edited

// Open the edit modal and populate fields with the selected itinerary item data
function editItinerary(index) {
    const storedItinerary = JSON.parse(localStorage.getItem('itinerary'));
    const item = storedItinerary[index];
    editIndex = index; // Store the index of the item being edited

    // Populate modal with existing data
    document.getElementById('edit-country-name').textContent = item.country.name.common;
    document.getElementById('edit-location').value = item.location;
    document.getElementById('edit-activities').value = item.activities;
    document.getElementById('edit-description').value = item.description;
    document.getElementById('edit-date').value = item.date;

    // Open the modal
    document.getElementById('edit-modal').style.display = 'block';
}

// Save the edited itinerary back to localStorage and reload the list
function saveEditedItinerary() {
    // Get updated values from the form
    const location = document.getElementById('edit-location').value;
    const activities = document.getElementById('edit-activities').value;
    const description = document.getElementById('edit-description').value;
    const date = document.getElementById('edit-date').value;

    // Update the selected itinerary item
    const storedItinerary = JSON.parse(localStorage.getItem('itinerary'));
    storedItinerary[editIndex] = { 
        ...storedItinerary[editIndex],
        location,
        activities,
        description,
        date
    };

    // Save the updated itinerary back to localStorage
    localStorage.setItem('itinerary', JSON.stringify(storedItinerary));

    // Reload the itinerary list
    loadItinerary();

    // Close the modal
    closeEditModal();
}

// Close the edit modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Remove an itinerary item by index and refresh the list
function removeItinerary(index) {
    let storedItinerary = JSON.parse(localStorage.getItem('itinerary'));
    storedItinerary.splice(index, 1);
    localStorage.setItem('itinerary', JSON.stringify(storedItinerary));
    loadItinerary();
}

// Save the itinerary item to a text file
function saveItineraryToFile(index) {
    const storedItinerary = JSON.parse(localStorage.getItem('itinerary'));
    const item = storedItinerary[index];
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
    link.download = `${item.country.name.common}_Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
