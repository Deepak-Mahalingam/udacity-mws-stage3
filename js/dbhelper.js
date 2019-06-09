/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const restaurants = JSON.parse(xhr.responseText);
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {

    // fetch all restaurants with proper error handling.
    DBHelper.fetchJSON(id, callback);


  }


  static fetchReviews(id, callback) {

    let xhr = new XMLHttpRequest();
    console.log('http://localhost:1337/reviews/?restaurant_id=' + id)
    xhr.open('GET', 'http://localhost:1337/reviews/?restaurant_id=' + id);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const reviews = JSON.parse(xhr.responseText);

        callback(reviews);
      }
    }
    xhr.send();
  }


  static fetchJSON(id, callback) {

    var db;

    var openRequest = indexedDB.open("ResponsDB", 1);

    openRequest.onupgradeneeded = function (e) {
      var thisDB = e.target.result;

      if (!thisDB.objectStoreNames.contains("restaurant")) {
        thisDB.createObjectStore("restaurant");
      }
    }

    openRequest.onsuccess = function (e) {

      db = e.target.result;

      var transaction = db.transaction(["restaurant"], "readwrite");
      var store = transaction.objectStore("restaurant");

      var request = store.get(String(id));

      request.onsuccess = function (e) {
        var rest = e.target.result;
        if (rest == undefined) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', DBHelper.DATABASE_URL + "/" + id);
          xhr.onload = function () {
            const restaurant = JSON.parse(xhr.responseText);
            if (restaurant) { // Got the restaurant
              DBHelper.storeJSON(restaurant, id);
              callback(null, restaurant);
            } else { // Restaurant does not exist in the database
              callback('Restaurant does not exist', null);
            }
          }
          xhr.send();
        }
        else {

          callback(null, rest);
        }
      }
    }

  }


  
  static storeReview(json, id) {
    var db;

    var openRequest = indexedDB.open("ResponsDB", 1);

    openRequest.onupgradeneeded = function (e) {
      var thisDB = e.target.result;

      if (!thisDB.objectStoreNames.contains("restaurant")) {
        thisDB.createObjectStore("restaurant");
      }
    }

    openRequest.onsuccess = function (e) {
      db = e.target.result;



      var objectStore = db.transaction(["restaurant"], "readwrite").objectStore("restaurant");
      var request = objectStore.get(id);

      request.onerror = function (event) {
        console.log("Request failed. Most likely due to first time access");
        var transaction = db.transaction(["restaurant"], "readwrite");
        var store = transaction.objectStore("restaurant");
        store.add(json, id);
        console.log("Added new entry in IDB ", json, id)
      };
      request.onsuccess = function (event) {
       var data = event.target.result;
       data=json;
        var requestUpdate = objectStore.put(data,id);
        requestUpdate.onerror = function (event) {
         console.log("Update of DB failed")
        };
        requestUpdate.onsuccess = function (event) {
          console.log("Update of DB succeeded");
        };
      };


    }


  }


  static storeJSON(json, id) {
    var db;

    var openRequest = indexedDB.open("ResponsDB", 1);

    openRequest.onupgradeneeded = function (e) {
      var thisDB = e.target.result;

      if (!thisDB.objectStoreNames.contains("restaurant")) {
        thisDB.createObjectStore("restaurant");
      }
    }

    openRequest.onsuccess = function (e) {
      db = e.target.result;

      var transaction = db.transaction(["restaurant"], "readwrite");
      var store = transaction.objectStore("restaurant");
      store.add(json, id);
      console.log("Added new entry in IDB ", json, id)
    }


  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph != undefined) {
      return (`/img/${restaurant.photograph}.jpg`);
    }
    else {
      return (`/img/${restaurant.id}.jpg`);
    }
  }

  static updateFav(restaurant, callback) {

    let xhr = new XMLHttpRequest();
    xhr.open('PUT', 'http://localhost:1337/restaurants/' + restaurant.id + '/?is_favorite=' + !restaurant.is_favorite);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!

        restaurant.is_favorite = !restaurant.is_favorite
        callback(restaurant, restaurant.id);
      }
    }
    xhr.send();
  }

  static newReview() {
    var db;

    var openRequest = indexedDB.open("ResponsDB", 1);

    openRequest.onupgradeneeded = function (e) {
      var thisDB = e.target.result;

      if (!thisDB.objectStoreNames.contains("restaurant")) {
        thisDB.createObjectStore("restaurant");
      }
    }

    openRequest.onsuccess = function (e) {

      db = e.target.result;

      var transaction = db.transaction(["restaurant"], "readwrite");
      var store = transaction.objectStore("restaurant");

      var request = store.get(String("review"));

      request.onsuccess = function (e) {
        var usrReview = e.target.result;

        fetch('http://localhost:1337/reviews/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usrReview)
        })
          .then(response => response);
      }
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      })
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */



}

