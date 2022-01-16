const firebaseConfig = {
  apiKey: "AIzaSyAsQb6h1-3QAU3nurRL7hkmhRqdMv-vd74",
  authDomain: "kawfee-eab15.firebaseapp.com",
  projectId: "kawfee-eab15",
  storageBucket: "kawfee-eab15.appspot.com",
  messagingSenderId: "308251858864",
  appId: "1:308251858864:web:da07b739cd402c25e3a875",
  measurementId: "G-QWT5MP0KCT",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

// db.collection("kawfees")
//   .get()
//   .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       // doc.data() is never undefined for query doc snapshots
//       //console.log(doc.id, " => ", doc.data());
//     });
//   });

// Targetting the SEARCH BAR and using it to set USER LOCATION
var userLatitude;
var userLongitude;
var userLocation;
var getUserLocationBtn = document.getElementById(
  "results-get-user-location-btn"
);

var cafes = [];
var checkInId;

// saveInput = () => {
//   var searchBar = document.getElementById("results-search-bar-input").value;
//   if (userLatitude == null || userLongitude == null) {
//     alert("Choose your location");
//   } else {
//     var inputGroup = document.getElementById("next-page-href-search");
//     var submitBtn = document.getElementById("submit-btn");
//     var goToNextPage = document.createElement("a");
//     goToNextPage.href = "/results.html";

//     goToNextPage.appendChild(submitBtn);
//     inputGroup.appendChild(goToNextPage);
//   }
// };

saveUserLocation = (position) => {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;

  initMap();
};

getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(saveUserLocation);
  } else {
    alert("Geolocation is not supported by this browser.");
  }

  var inputGroup = document.getElementById("next-page-href-locator");
  var goToNextPage = document.createElement("a");
  goToNextPage.href = "/results.html";

  goToNextPage.appendChild(getUserLocationBtn);
  inputGroup.appendChild(goToNextPage);
};

// BELOW THIS LINE IS GOOGLE PLACES API
let map;

initMap = () => {
  userLocation = new google.maps.LatLng(userLatitude, userLongitude);

  map = new google.maps.Map(document.getElementById("map"), {
    center: userLocation,
    zoom: 8,
  });

  var request = {
    location: userLocation,
    type: ["cafe"],
    rankBy: google.maps.places.RankBy.DISTANCE,
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
};

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      cafes.push(results[i]);
    }
  }
}

async function renderCards() {
  try {
    const kawfeesSnap = await db.collection("kawfees").get();

    for (const kawfeeSnap of kawfeesSnap.docs) {
      const data = kawfeeSnap.data();
      const address = kawfeeSnap.id;
      const name = data.name;
      const distance = (Math.round(data.distance) / 1000).toFixed(2);
      const imageUrl = data.image;
      const numPeople = data.nPeople;

      // Creates the row in which result tiles are displayed
      const resultsRow = document.getElementById("results-tile");

      // Creates a single card (will display everything about a specific cafe)
      const cardContainer = document.createElement("div");
      cardContainer.classList.add("col-lg-3");
      cardContainer.classList.add("col-md-6");
      cardContainer.classList.add("col-sm-12");

      resultsRow.appendChild(cardContainer);

      const card = document.createElement("div");
      card.classList.add("card");

      cardContainer.appendChild(card);

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      card.appendChild(cardBody);

      const textCenter = document.createElement("div");
      textCenter.classList.add("text-center");
      const cafeImage = document.createElement("img");
      cafeImage.classList.add("rounded");
      cafeImage.src = imageUrl;
      cafeImage.style.width = "40px";
      cafeImage.style.height = "40px";

      textCenter.appendChild(cafeImage);
      cardBody.appendChild(textCenter);

      const cardTitle = document.createElement("h5");
      cardTitle.classList.add("card-title");
      cardTitle.innerHTML = name;

      cardBody.appendChild(cardTitle);

      const addressText = document.createElement("h6");
      addressText.id = "location-address";
      const small = document.createElement("small");
      small.innerHTML = address;

      addressText.appendChild(small);
      cardBody.appendChild(addressText);

      const cardText = document.createElement("div");
      cardText.classList.add("card-text");
      const numOfPeople = document.createElement("p");
      numOfPeople.id = "number-of-people";
      numOfPeople.innerHTML = numPeople + " people are checked in";
      const distanceText = document.createElement("p");
      distanceText.id = "distance";

      cardText.appendChild(numOfPeople);

      const iconContainer = document.createElement("a");
      iconContainer.classList.add("btn");
      iconContainer.classList.add("btn-secondary");
      iconContainer.href = "http://maps.google.com/?q=" + kawfeeSnap.id;

      const mapIcon = document.createElement("i");
      const distanceTextContainer = document.createElement("p");
      distanceTextContainer.id = "distance-text";
      distanceTextContainer.innerHTML = distance + " km";
      mapIcon.classList.add("bi");
      mapIcon.classList.add("bi-geo-alt-fill");
      mapIcon.id = "map-icon";
      mapIcon.appendChild(distanceTextContainer);

      iconContainer.appendChild(mapIcon);
      distanceText.appendChild(iconContainer);
      cardText.appendChild(distanceText);

      const goToCheckIn = document.createElement("a");
      const checkInBtnSpan = document.createElement("span");
      checkInBtnSpan.id = "check-in-page-href";
      const checkInBtn = document.createElement("button");
      checkInBtn.classList.add("btn");
      checkInBtn.classList.add("btn-primary");
      const checkInIcon = document.createElement("i");
      checkInIcon.classList.add("bi");
      checkInIcon.classList.add("bi-arrow-right-circle");
      checkInIcon.classList.add("check-in-icon");
      checkInIcon.id = address;

      checkInBtn.appendChild(checkInIcon);
      goToCheckIn.appendChild(checkInBtn);
      checkInBtnSpan.appendChild(goToCheckIn);
      checkInBtn.onclick = () => {
        goToCheckIn.href = "/checkin.html";
        checkInBtnSpan.appendChild(goToCheckIn);
        checkInId = checkInIcon.id;
        localStorage.setItem("checkInId", checkInIcon.id);
        localStorage.setItem("latitude", data.latitude);
        localStorage.setItem("longitude", data.longitude);
      };

      cardBody.appendChild(checkInBtnSpan);
      cardBody.appendChild(cardText);
    }
  } catch (error) {
    console.log(error);
  }
}

renderCards();
