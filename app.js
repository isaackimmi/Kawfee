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

// Targetting the SEARCH BAR and using it to set USER LOCATION
var userLatitude;
var userLongitude;
var userLocation;
var getUserLocationBtn = document.getElementById("index-get-user-location-btn");

var cafes = [];

// indexSaveInput = () => {
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
  //getUserLocationBtn.disabled = false;
};

indexGetUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(saveUserLocation);
  } else {
    alert("Geolocation is not supported by this browser.");
  }

  if (cafes.length > 0) {
    var inputGroup = document.getElementById("next-page-href-locator");
    var goToNextPage = document.createElement("a");
    goToNextPage.href = "/results.html";

    goToNextPage.appendChild(getUserLocationBtn);
    inputGroup.appendChild(goToNextPage);
  }
};

// BELOW THIS LINE IS GOOGLE PLACES API
let map;

initMap = () => {
  userLocation = new google.maps.LatLng(userLatitude, userLongitude);

  map = new google.maps.Map(document.getElementById("index-map"), {
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
      console.log(cafes[i]);
    }

    cafes.forEach((element) => {
      var cafeLatitude = element.geometry.location.lat();
      var cafeLongitude = element.geometry.location.lng();
      var cafeLocation = new google.maps.LatLng(cafeLatitude, cafeLongitude);
      var cafeImageUrl = element.icon;

      var distanceBetween =
        google.maps.geometry.spherical.computeDistanceBetween(
          userLocation,
          cafeLocation
        );
      var docRef = db.collection("kawfees").doc(element.vicinity);
      docRef.get().then((doc) => {
        if (!doc.exists) {
          addKawfees(
            element.name,
            element.vicinity,
            distanceBetween,
            cafeImageUrl,
            cafeLatitude,
            cafeLongitude
          );
        }
      });
    });
  }
}

async function addKawfees(name, address, distance, image, latitude, longitude) {
  try {
    const res = await db.collection("kawfees").doc(address).set({
      name: name,
      distance: distance,
      image: image,
      nPeople: 0,
      latitude: latitude,
      longitude: longitude,
    });
  } catch (error) {
    console.log(error);
  }
}
