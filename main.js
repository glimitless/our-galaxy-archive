

// Imports three.js library
import * as THREE from 'three';


// Allows orbit controls to be called as a method
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';

import { FontLoader } from './three/examples/jsm/loaders/FontLoader.js';

import { TextGeometry } from './three/examples/jsm/geometries/TextGeometry.js';



// initiates the three.js scene
const { camera, renderer, scene, loader, initialCameraPosition } = initScene();

let loadedFont;

loadFont()

// Positions the camera
camera.position.z = 5;
// Initiates the sunlight
const sunLight = initSunlight();

var framePerSec = 0;
var timer = 0;

  
// Gets the camera position
const cameraPosition = camera.position;
// Checks if camera needs to be reset into starting position
var returnToCenter = false;
var returnToBirdsEyeView = false;

// Initiates raycaster
const raycaster = new THREE.Raycaster();
// Initiates raycaster target
const pointer = new THREE.Vector2();

// Confirms if user is clicking the mouse
let isMouseDown = false;

// Allows for planet navigation menu to run clickPlanet() function
let navPass = false;

// Checks if planet overlay is currently displayed
let isOverlayUp = false;

// Checks if the scene is in birds-eye-view mode
let isInBirdsEyeView = false;

// Ranges for increaseScalePlanets() & decreaseScalePlanets()
const increasedScale = 1.9;
const baseScale = 1;

// Determines which angle all the planets start at in sameAngleDegrees()
const sameAngleDegrees = 0;

// Arrays that hold references to scene objects
let allOrbits = [];
let allTraveledPaths = [];
let allPlanets = [];
let textMeshes = [];

// Define the starting position and birds-eye view position
const startingPosition = new THREE.Vector3(0, 0, 5); // Example starting position
const birdsEyeViewPosition = new THREE.Vector3(0, 370, 0); // Example birds-eye view position

// Define the starting rotation and birds-eye view rotation
const startingRotation = new THREE.Euler(0, 0, 0); // Example starting rotation
const birdsEyeViewRotation = new THREE.Euler(-Math.PI / 2, 0, 0); // Example birds-eye view rotation, looking down


// Toggles the birds-eye-view mode on activation of the switch
document.getElementById('viewToggle').addEventListener('change', function(event) {
  // Checks if the switch is or is not checked
  if (event.target.checked) {
    // Switches the camera to birds-eye view
    isInBirdsEyeView = true;
    camera.position.copy(birdsEyeViewPosition);
    camera.rotation.copy(birdsEyeViewRotation);

    // Makes the stars invisible
    scene.children.forEach((child) =>{
      if(child.name === "stars"){
          child.visible = false;
      }
    });

    // Initiates the sun into the scene
    initSun();

    // Outlines all orbits and the path traveled outline
    outlineAllOrbits();

    // Places all planets at the same starting angle
    samePlanetAngles();

    // Increases the size of the planet meshes
    increaseScalePlanets();

    
    
  } else {
    // Return to starting view
    isInBirdsEyeView = false;

    // Returns camera to center of planetary dome
    camera.position.copy(startingPosition);
    camera.rotation.copy(startingRotation);
    
    // Returns the size of the planets back to normal
    decreaseScalePlanets();

    // Removes the sun and reveals the stars in the scene.
    removeSunRevealStars();

    // Removes reference to SunMesh
    sun = null;

    // Removes of orbit outlines & text meshes from the scene
    removeAllOrbitAndTextMeshes();  

    // Randomizes the positions of the planets
    randomizePlanetAngles();

    // Removes all references to orbit outlines from planet meshes
    allPlanets.forEach(planet => {
        planet.orbit = "";
        planet.traveledPath = "";
        planet.orbitGeometry = "";
    });

    
  }

  // Updates the camera
  camera.updateProjectionMatrix();
});


// Resizes javascript canvas whenever viewport is resized
window.addEventListener('resize', onWindowResize);

// Listens for whenever mouse is clicked
document.addEventListener('click', function(event) {
    // Mouse button is pressed down
    isMouseDown = true;

    // Resets isMouseDown to false
    setTimeout(function() {
      // Mouse button is released
      isMouseDown = false;
    }, 10);
});

// Records current position of mouse
document.addEventListener( 'pointermove', onPointerMove );

// Closes overlay when x icon is pressed
document.getElementById('close-overlay').addEventListener('click', hideOverlay);


// Declares mesh layers of planets & the Sun
let mercuryMesh;
let venusMesh;
let earthMesh;
let marsMesh;
let jupiterMesh;
let saturnMesh;
let uranusMesh;
let neptuneMesh;
let sunMesh;


// Holds all movement variables of planets
const planets = {
  mercury: {orbitIncline: 7.0, orbitRadius: 50, orbitSpeed: 0.00479, rotationSpeed: 0.001083, start: Math.random() * 360,},
  venus: {orbitIncline: 3.395, orbitRadius: 75, orbitSpeed: 0.0035, rotationSpeed: 0.00652, start: Math.random() * 360,},
  earth: {orbitIncline: 0, orbitRadius: 100, orbitSpeed: 0.00298, rotationSpeed: 0.001574, start: Math.random() * 360,},
  mars: {orbitIncline: 1.848, orbitRadius: 125, orbitSpeed: 0.0024, rotationSpeed: 0.00652, start: Math.random() * 360,},
  jupiter: {orbitIncline: 1.31, orbitRadius: 150, orbitSpeed: 0.00131, rotationSpeed: 0.0045583, start: Math.random() * 360,},
  saturn: {orbitIncline: 2.486, orbitRadius: 175, orbitSpeed: 0.000969, rotationSpeed: 0.0036840, start: Math.random() * 360,},
  uranus: {orbitIncline: 0.770, orbitRadius: 200, orbitSpeed: 0.000681, rotationSpeed: 0.0014794, start: Math.random() * 360},
  neptune: {orbitIncline: 1.770, orbitRadius: 225, orbitSpeed: 0.000543, rotationSpeed: 0.009719, start: Math.random() * 360},
}


// Holds current positions of planets
const planetPositions = {
    mercury: {x: Math.cos(planets.mercury.start) * planets.mercury.orbitRadius, z: Math.sin(planets.mercury.start) * planets.mercury.orbitRadius,},
    venus: {x: Math.cos(planets.venus.start) * planets.venus.orbitRadius, z: Math.sin(planets.venus.start) * planets.venus.orbitRadius},
    earth: {x: Math.cos(planets.earth.start) * planets.earth.orbitRadius, z: Math.sin(planets.earth.start) * planets.earth.orbitRadius},
    mars: {x: Math.cos(planets.mars.start) * planets.mars.orbitRadius, z: Math.sin(planets.mars.start) * planets.mars.orbitRadius},
    jupiter: {x: Math.cos(planets.jupiter.start) * planets.jupiter.orbitRadius, z: Math.sin(planets.jupiter.start) * planets.jupiter.orbitRadius},
    saturn: {x: Math.cos(planets.saturn.start) * planets.saturn.orbitRadius, z: Math.sin(planets.saturn.start) * planets.saturn.orbitRadius},
    uranus: {x: Math.cos(planets.uranus.start) * planets.uranus.orbitRadius, z: Math.sin(planets.uranus.start) * planets.uranus.orbitRadius},
    neptune: {x: Math.cos(planets.neptune.start) * planets.neptune.orbitRadius, z: Math.sin(planets.neptune.start) * planets.neptune.orbitRadius},


}

// Holds colours for orbit outlines
const orbitColors = {
  base: {color: "#ffffff",},
  mercury: {key: 0, color:"#ecd67e",},
  venus: {key: 1, color:"#e39e1c",},
  earth: {key: 2, color: "#228B22",},
  mars: {key: 3, color: "#c1440e",},
  saturn: {key: 4, color: "#af8b8b",},
  jupiter: {key: 5, color: "#c99039",},
  uranus: {key: 6, color: "#37c0d6",},
  neptune: {key: 7, color: "#5b5ddf",},
}
// Sets default size of all planets
const planetSize = 4;

// Holds all description text for planet overlay div
const planetDescriptions = {
  mercury: [
    {name: "summary", description: "Mercury is the smallest and innermost planet in the Solar System. It is named after the Roman deity Mercury, the messenger of the gods."},
    {name: "moons", description: "Mercury, the closest planet to the Sun, has no natural satellites. Its lack of moons is thought to be due to its proximity to the Sun and the Sun's gravitational forces."},
    {name: "formation", description: "Mercury formed about 4.5 billion years ago when gravity pulled swirling gas and dust together to form this small, rocky planet. Its close proximity to the Sun has significantly influenced its composition and atmosphere."},
    {name: "composition", description: "Mercury's surface resembles that of the Moon, featuring extensive mare-like plains and heavy cratering, indicating a geologically inactive planet composed mainly of silicate minerals and metals."},
    {name: "discovery", description: "Mercury has been known since ancient times, visible to the naked eye. Its earliest recorded observations date back to the Sumerians around 3000 BC."},
    {name: "exploration", description: "The exploration of Mercury has been limited due to its proximity to the Sun. Notable missions include Mariner 10 and MESSENGER, which have provided valuable data on its composition, magnetic field, and atmosphere."},
    {name: "astrology", description: "In astrology, Mercury is associated with communication, intellect, and awareness. Its position in the zodiac is believed to influence analytical thinking, language, and the way we process information."},
  ],
  venus: [
    {name: "summary", description: "Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. Venus is the second-brightest natural object in the night sky after the Moon."},
    {name: "moons", description: "Venus, the second planet from the Sun, has no moons. Its dense atmosphere and proximity to Earth have made it a subject of much observation and interest."},
    {name: "formation", description: "Venus formed from the solar nebula approximately 4.5 billion years ago. Its formation process was similar to Earth's, but its closer distance to the Sun has led to a vastly different climate and atmosphere."},
    {name: "composition", description: "Venus has a rocky body with a metallic iron core. Its thick, toxic atmosphere is primarily composed of carbon dioxide, with clouds of sulfuric acid, making it the hottest planet in our solar system."},
    {name: "discovery", description: "Known as the 'morning star' and 'evening star,' Venus has been observed by humans for millennia. Ancient civilizations often associated it with their goddesses of love and beauty."},
    {name: "exploration", description: "Venus has been explored by numerous spacecraft, including the Soviet Venera program and NASA's Magellan mission, which mapped its surface with radar."},
    {name: "astrology", description: "In astrology, Venus governs love, beauty, and harmony. Its influence is associated with our appreciation of beauty, our emotional responses, and our values in relationships."},
  ],
  earth: [
    {name: "summary", description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29.2% of Earth's surface is land, and the remaining 70.8% is covered with water."},
    {name: "moons", description: "Earth's Moon, the only natural satellite of our planet, plays a crucial role in Earth's tides and stabilizing the planet's axial tilt, which is essential for maintaining a stable climate."},
    {name: "formation", description: "Earth was formed approximately 4.5 billion years ago from the solar nebula. Its formation led to the creation of a planet with liquid water and a suitable atmosphere for life."},
    {name: "composition", description: "Earth's composition is unique in the Solar System, with a core of iron and nickel, a silicate mantle and crust, and a rich atmosphere that supports life by regulating temperature and protecting from harmful solar radiation."},
    {name: "discovery", description: "The realization that Earth is a planet orbiting the Sun came during the Copernican Revolution in the 16th century, challenging the geocentric model of the universe."},
    {name: "exploration", description: "Human exploration of Earth includes the mapping of continents and oceans, the study of its geology and biodiversity, and the ongoing exploration of its atmospheric and oceanic systems."},
    {name: "astrology", description: "In astrology, Earth is not typically considered as it is the central point of reference. However, its position in space relative to other planets is used to calculate astrological charts."},
  ],
  mars: [
    {name: "summary", description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, after Mercury. Mars is often called the 'Red Planet' due to its reddish appearance."},
    {name: "moons", description: "Mars has two small moons, Phobos and Deimos, believed to be captured asteroids. These moons are irregular in shape and significantly smaller than Earth's Moon."},
    {name: "formation", description: "Mars formed about 4.6 billion years ago from the solar nebula, similar to the other planets in the solar system. Its formation and evolution have been significantly influenced by its size, leading to the loss of its magnetic field and much of its atmosphere over time."},
    {name: "composition", description: "Mars is known for its red color, which comes from iron oxide or rust on its surface. It has a thin atmosphere composed mostly of carbon dioxide, with surface features reminiscent of both Earth and the Moon."},
    {name: "discovery", description: "Mars has been observed since ancient times, and its reddish appearance is visible to the naked eye. Detailed observations by astronomers like Tycho Brahe and Johannes Kepler in the 16th century laid the groundwork for our understanding of its motion."},
    {name: "exploration", description: "Mars has been a focal point for space exploration, with missions like Viking, Pathfinder, and the Mars Exploration Rovers providing insights into its geology, atmosphere, and potential for past life."},
    {name: "astrology", description: "In astrology, Mars represents energy, action, and desire. Its position in the zodiac is said to influence our courage, passion, and assertive behaviors."},
  ],
  jupiter: [
    {name: "summary", description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined."},
    {name: "moons", description: "Jupiter, the largest planet in our solar system, has a vast number of moons, including the four large Galilean moons discovered by Galileo Galilei in 1610. These moons are fascinating worlds of their own, with volcanic activity and subsurface oceans."},
    {name: "formation", description: "Jupiter formed from the gas and dust left over after the sun's formation, quickly growing to massive sizes due to its strong gravitational pull, capturing a large amount of hydrogen and helium."},
    {name: "composition", description: "Jupiter is a gas giant primarily composed of hydrogen and helium. Its famous Great Red Spot is a storm that has raged for at least 400 years, and it possesses a complex layer of clouds and storms."},
    {name: "discovery", description: "Jupiter has been known to astronomers since ancient times. The planet is named after the Roman king of the gods, reflecting its status as the largest planet in our solar system."},
    {name: "exploration", description: "Jupiter has been visited by several spacecraft, including Pioneer, Voyager, and the Galileo orbiter, providing valuable data about the planet, its rings, and moons."},
    {name: "astrology", description: "In astrology, Jupiter is associated with luck, growth, and expansion. Its position in the zodiac is believed to influence prosperity, philosophy, and the search for meaning."},
  ],
  saturn: [
    {name: "summary", description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth."},
    {name: "moons", description: "Saturn is renowned for its extensive ring system, made up of ice particles, rocky debris, and dust. It has numerous moons, including Titan, one of the most Earth-like worlds discovered to date."},
    {name: "formation", description: "Saturn formed about 4.5 billion years ago from the gas and dust remaining after the sun's formation. Its rings are thought to be remnants of comets, asteroids, or shattered moons."},
    {name: "composition", description: "Saturn is a gas giant with an atmosphere primarily composed of hydrogen and helium. Its internal structure includes a rocky core, surrounded by a deep layer of metallic hydrogen."},
    {name: "discovery", description: "Saturn has been observed by humans for thousands of years. Ancient cultures, including the Babylonians, were familiar with Saturn and it was named after the Roman god of agriculture and wealth."},
    {name: "exploration", description: "Saturn has been explored by spacecraft such as Voyager 1 and 2 and the Cassini-Huygens mission, which studied the planet, its rings, and moons in great detail."},
    {name: "astrology", description: "In astrology, Saturn represents discipline, responsibility, and restraint. Its position is thought to influence our sense of duty, structure, and challenges in life."},
  ],
  uranus: [
    {name: "summary", description: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Uranus is similar in composition to Neptune, and both have bulk chemical compositions which differ from that of the larger gas giants Jupiter and Saturn."},
    {name: "moons", description: "Uranus, the ice giant, is known for its unique sideways rotation and pale blue color due to methane in its atmosphere. It has a ring system and numerous moons."},
    {name: "formation", description: "Uranus formed about 4.5 billion years ago from the gas and dust in the early solar system. Its tilted axis is thought to be the result of a collision with an Earth-sized object."},
    {name: "composition", description: "Uranus's atmosphere is mostly hydrogen and helium, with a higher share of 'ices' such as water, ammonia, and methane compared to Jupiter and Saturn. This composition gives Uranus its distinct pale blue color. The presence of methane, which absorbs red light and reflects blue, is responsible for this unique hue."},
    {name: "discovery", description: "Uranus was discovered by William Herschel in 1781, making it the first planet found using a telescope. Its discovery expanded the known boundaries of our solar system and challenged existing models of planetary motion."},
    {name: "exploration", description: "The exploration of Uranus has been limited, with the Voyager 2 spacecraft providing the bulk of our current knowledge during its flyby in 1986. This mission revealed Uranus's complex ring system and detailed characteristics of its moons."},
    {name: "astrology", description: "In astrology, Uranus represents change, innovation, and revolution. Its influence is associated with sudden shifts, freedom, and breaking from tradition to embrace new ways of thinking."},
  ],
  neptune: [
    {name: "summary", description: "Neptune is the eighth and farthest known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet."},
    {name: "moons", description: "Neptune is known for its dynamic weather systems and has 14 known moons, including Triton, a geologically active moon with geysers of liquid nitrogen. Triton is unique as it orbits Neptune in a direction opposite to the planet's rotation."},
    {name: "formation", description: "Neptune formed about 4.5 billion years ago, likely from the accretion of a core of ice and rock surrounded by a dense atmosphere of hydrogen, helium, and water vapor, similar to Uranus."},
    {name: "composition", description: "Neptune's atmosphere is composed primarily of hydrogen and helium, with traces of methane, water, and ammonia. This composition results in its striking blue color, similar to Uranus, but Neptune's deeper and more vivid blue is due to an unknown component."},
    {name: "discovery", description: "Neptune was the first planet located through mathematical predictions rather than through regular observation. Its existence was predicted by Urbain Le Verrier, and it was discovered by Johann Galle in 1846."},
    {name: "exploration", description: "Neptune has been visited by only one spacecraft, Voyager 2, in 1989. The flyby provided invaluable data on Neptune's weather, moons, and magnetic field."},
    {name: "astrology", description: "In astrology, Neptune is associated with dreams, intuition, and the subconscious. Its position is thought to influence creativity, spirituality, and our connection with universal truths."},
  ]
};

// Holds all links for planet overlay div
const planetLinks = {
  mercury: [
    {name: "moons", url:"https://phys.org/news/2016-01-moons-mercury.html"},
    {name: "formation", url: "https://www.space.com/18641-mercury-formation.html"},
    {name: "composition", url: "https://www.space.com/18643-mercury-composition.html"},
    {name: "discovery", url: "https://www.universetoday.com/38170/who-discovered-mercury/"},
    {name: "exploration", url: "https://science.nasa.gov/mercury/exploration/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/mercury/"},
  ],
  venus: [
    {name: "moons", url: "https://phys.org/news/2014-04-moons-venus.html"},
    {name: "formation", url: "https://www.space.com/18524-how-was-venus-formed.html"},
    {name: "composition", url: "https://www.space.com/18525-venus-composition.html"},
    {name: "discovery", url: "https://www.universetoday.com/22560/discovery-of-venus/"},
    {name: "exploration", url: "https://science.nasa.gov/venus/exploration/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/venus/"},
  ],
  earth: [
    {name: "moons", url: "https://science.nasa.gov/moon/facts/"},
    {name: "formation", url: "https://www.space.com/19175-how-was-earth-formed.html"},
    {name: "composition", url: "https://education.nationalgeographic.org/resource/resource-library-earth-structure/"},
    {name: "discovery", url: "https://www.universetoday.com/26853/who-discovered-the-earth/"},
    {name: "exploration", url: "https://science.nasa.gov/earth/exploration/"},
    {name: "astrology", url: "https://www.wikihow.com/What-Does-Planet-Earth-Represent-in-Astrology"},
  ],
  mars: [
    {name: "moons", url: "https://science.nasa.gov/mars/moons/"},
    {name: "formation", url: "https://www.space.com/16912-how-was-mars-made.html"},
    {name: "composition", url: "https://phys.org/news/2015-02-mars.html"},
    {name: "discovery", url: "https://www.lpi.usra.edu/education/explore/mars/background/"},
    {name: "exploration", url: "https://science.nasa.gov/mars/exploration/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/mars/"},
  ],
  jupiter: [
    {name: "moons", url: "https://science.nasa.gov/jupiter/moons/"},
    {name: "formation", url: "https://www.space.com/18389-how-was-jupiter-formed.html"},
    {name: "composition", url: "https://www.space.com/18388-what-is-jupiter-made-of.html"},
    {name: "discovery", url: "https://www.universetoday.com/15142/discovery-of-jupiter/"},
    {name: "exploration", url: "https://science.nasa.gov/jupiter/exploration/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/jupiter/"},
  ],
  saturn: [
    {name: "moons", url: "https://science.nasa.gov/saturn/moons/"},
    {name: "formation", url: "https://www.space.com/18471-how-was-saturn-formed.html"},
    {name: "composition", url: "https://www.space.com/18472-what-is-saturn-made-of.html"},
    {name: "discovery", url: "https://www.universetoday.com/46237/who-discovered-saturn/"},
    {name: "exploration", url: "https://science.nasa.gov/saturn/exploration/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/saturn/"},
  ],
  uranus: [
    {name: "moons", url: "https://science.nasa.gov/uranus/moons/"},
    {name: "formation", url: "https://www.space.com/18705-how-was-uranus-formed.html"},
    {name: "composition", url: "https://www.space.com/18706-uranus-composition.html"},
    {name: "discovery", url: "https://www.nasa.gov/history/240-years-ago-astronomer-william-herschel-identifies-uranus-as-the-seventh-planet/"},
    {name: "exploration", url: "https://maxpolyakov.com/exploring-uranus/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/uranus/"},
  ],
  neptune: [
    {name: "moons", url: "https://science.nasa.gov/neptune/moons/"},
    {name: "formation", url: "https://www.space.com/18919-neptune-formation.html"},
    {name: "composition", url: "https://www.universetoday.com/21596/what-is-neptune-made-of-1/"},
    {name: "discovery", url: "https://www.nasa.gov/history/175-years-ago-astronomers-discover-neptune-the-eighth-planet/"},
    {name: "exploration", url: "https://science.nasa.gov/uranus/exploration/"},
    {name: "astrology", url: "https://www.zodiacsign.com/astrology/planets/neptune/"},
  ],


};

// Holds all orbital periods for the planets
const orbitalPeriods = {
  mercury: {
    days: "88 days",
    years: "0.241 years",
    eYears: "0.241 Earth years",
    
  },
  venus: {
    days: "224.7 days",
    years: "0.615 years",
    eYears: "0.615 Earth years",
    },
  earth: {
    days: "365.26 days",
    years: "1 year", 
    eYears: "1 Earth year", 
  },
  mars: {
    days: "687 days",
    years: "1.882 years",
    eYears: "1.882 Earth years",
  },
  jupiter: {
    days: "4328.9 days",
    years: "11.86 years",
    eYears: "11.86 Earth years",
  },
  saturn: {
    days: "10,756 days",
    years: "29.4 years",
    eYears: "29.4 Earth years",
  },
  uranus: {
    days: "30,687 days",
    years: "84 years",
    eYears: "84 Earth years",
  },
  neptune: {
    days: "60,190 days",
    years: "165 years",
    eYears: "165 Earth years",
  },


}

// Stores the planet that was last clicked on
let clickedPlanet = null;

// Reference to SunMesh
let sun = null;

// Initiates the stars
const stars = getStarfield();

// Adds stars to the scene
scene.add(stars);

// Initiates the orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Initiates all planets
initPlanets();


// Populates the planet menu
const planetNames = Object.keys(planets);
const planetList = document.getElementById('planet-list');
planetNames.forEach(name => {
  const li = document.createElement('li');
  li.textContent =  name
  li.style.cursor = 'pointer';
  // Redirects the camera to track the planet clicked on in the planet navigation menu
  li.addEventListener('click', function() {
    

      for (var i=0; i < scene.children.length; i++){
          for(const object of scene.children[i].children){
            if(object.material){
                if (object.name === name) {
                    // Allows clickPlanet() function to be run
                    navPass = true;
                    

                     // If a planet was previously clicked, returns the orbital incline the planet to its original value 
                    if(clickedPlanet){
                        scene.children.forEach((child) =>{
                            if(clickedPlanet.name === child.name){
                              child.rotation.z = planets[clickedPlanet.name].orbitIncline * Math.PI/180;
                            }
                        });
                    }

                    // Redirects camera to focus on the selected planet
                    clickPlanet(object);
                }
            } 
          }
      }
      // Close the menu after selection
      togglePlanetMenu();
});
  
  planetList.appendChild(li);
});

// Waits for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
 
  // Opens planet menus when menu icon is clicked on
  document.addEventListener('click', function(event) {
    var planetMenu = document.getElementById('planet-menu');
    var menuIcon = document.getElementById('menu-icon');

    // Check if the click was inside the planet menu or on the menu icon
    if (!planetMenu.contains(event.target) && !menuIcon.contains(event.target)) {
        if (planetMenu.style.opacity === '0.6') {
            togglePlanetMenu(); // Close the menu if it's open
        }
    } else if (menuIcon.contains(event.target)) {
        togglePlanetMenu(); // Toggle the menu when the icon is clicked
    }
});
  
   
   
});


// Renders the Javascript scene
render();


// Renders Javascript scene
function render() {
    
    // Updates the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);
    
    // Calculates objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);
    
    // Change color of intersected objects to red and reset others to white
    // Also checks if planet has been clicked
    
    for (var i=0; i < scene.children.length; i++) {
      if(scene.children[i].type === "Group"){
        for(const object of scene.children[i].children){
          if (object.material && object.name != "sun") {
            const isIntersected = intersects.find(intersect => intersect.object === object);

            
            if (isIntersected && !isOverlayUp) {
              
              // Sets color to blue for intersected objects
              object.material.color.set(0x0056b3); 

              // Checks if planet has been clicked on, if yes runs the appropriate script
              clickPlanet(object);
              
            } else {
              // Sets color to white for non-intersected objects
              object.material.color.set(0xffffff); 
            }
          }
        }
      }
    };
    

    // Updates sunlight position to match camera position
    sunLight.position.copy(camera.position);

    // Calculates the forward direction of the camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // Calculates a target position based on the camera's forward direction
    const targetPosition = new THREE.Vector3().addVectors(camera.position, cameraDirection);

    // Updates the sunlight to face the target position
    sunLight.target.position.copy(targetPosition);
    sunLight.target.updateMatrixWorld();

    // If planet has been clicked, sets camera to follow the planet
    followPlanet();
    
    // Updates position of the planets
    updateData();

    // Render the scene
    renderer.render(scene, camera);

    // Updates progress on the planets orbital path
    if(isInBirdsEyeView){
      updateTraveledPath("mercury");
      updateTraveledPath("venus");
      updateTraveledPath("earth");
      updateTraveledPath("mars");
      updateTraveledPath("jupiter");
      updateTraveledPath("saturn");
      updateTraveledPath("uranus");
      updateTraveledPath("neptune");


    }

    // Amimates the render
    requestAnimationFrame(render);
    
}

// Checks if planet has planet clicked on. If yes runs the appropriate script.
function clickPlanet(planet){
  if(isMouseDown || navPass){
      // Toggle the clickedPlanet state
      if(clickedPlanet === planet){

        // Returns the orbital incline the planet to original value
        scene.children.forEach((child) =>{
            if(planet.name === child.name){
                child.rotation.z = planets[planet.name].orbitIncline * Math.PI/180;
            }
        });

          // Confirms no planet should be tracked by camera
          clickedPlanet = null;
          

          if(isInBirdsEyeView){
             // Confirms camera should be returned to birds-eye-view
            returnToBirdsEyeView = true;
            // Increases the size of the planets
            increaseScalePlanets();
          }else{
             // Confirms camera should be returned to center of scene
             returnToCenter = true;
            
          }
          // Hides the planet overlay
          hideOverlay();

          
          

          
          // Show the intro text again
          document.getElementById('introText').style.display = 'block';

          // Ends the planet navigation menu's access to the clickPlanet() function
          navPass = false;
          
      } else {
          
          // Indicates which planet for the camera to track
          clickedPlanet = planet;
          if (isInBirdsEyeView){
              decreaseScalePlanets();
          }
          // Sets the orbital incline of the planet to zero
          scene.children.forEach((child) =>{
              if(planet.name === child.name){
                  child.rotation.z = 0;
              }
            }
          )

          // Opens overlay div for the clicked planet
          showOverlayForPlanet(planet);

          // Hides the intro text
          document.getElementById('introText').style.display = 'none';
          
          // Ends the planet navigation menu's access to the clickPlanet() function
          navPass = false;
      }
  }
}

// Opens overlay div for the specified planet
function showOverlayForPlanet(planet) {

    // Creates references to existing html divs
    const overlay = document.getElementById('planet-info-overlay');
    const planetName = document.getElementById('planet-name');
    const descriptionContainer = document.getElementById('planet-description');
    let descriptionFromObject = "";

    
    // Sets the name and description based on the clicked planet
    planetName.textContent = planet.name;

    // Returns description to planet summary text whenever the planet name is clicked
    document.getElementById('planet-name').addEventListener('click', createNameClickListener(planet.name));

    // Sets the tabs of the planet overlay div
    setPlanetTabs(planet.name.toLowerCase());

    
    if(!isInBirdsEyeView){
      // Finds the description within an object for the given planet name
      descriptionFromObject = planetDescriptions[planet.name.toLowerCase()].find(entry => entry.name === "summary");
      // fills the description container with the planet summary text
      descriptionContainer.textContent = descriptionFromObject.description // Using the planetDescriptions object
      descriptionContainer.className = "planetInformation";
      
    }else{
      // Fills the description container with details pertaining to the orbit of the selected planet
      descriptionContainer.textContent = "Orbital Period: " + orbitalPeriods[planet.name].eYears;
      descriptionContainer.className = "planetInformationWidthExp";
      
    }
    
    
    // Displays the planet overlay
    overlay.style.display = 'block'; 

    // Confirms the planet overlay is visible
    isOverlayUp = true;
}

// Allows for planet name event listener to be referenced
function createNameClickListener(planetName) {
  // This function now directly handles clicks on the #planet-name element
  return function(event) {
    // Directly calls the handler without searching the DOM
    planetNameClickHandler(planetName, event);
  };
}

// Handles the event listener for when the planet name is clicked on
function planetNameClickHandler(planetName){
  // Updates the overlay div description with a brief summary of the planet 
  const aspectName = "summary";
  updatePlanetDescription(planetName, aspectName);
}

// Sets the tabs for the planet overlay div
function setPlanetTabs(planetName) {

  // Creates reference for html div that holds the tabs
  const tabsContainer = document.getElementById('planet-tabs');
  // Clears existing tabs
  tabsContainer.innerHTML = ''; 


  if(!isInBirdsEyeView){
    // Isolates object with aspect names & descriptions for specified planet
    const aspects = planetDescriptions[planetName];

  // Creates tab for each aspect
    if (aspects) {
        aspects.forEach(aspect => {
          if(aspect.name != "summary"){
            const p = document.createElement('p');
            p.textContent = aspect.name;
            p.className = 'planet-info-tabs'; // Use the class for styling
            tabsContainer.appendChild(p);
            
            
            // Create and append the line break
            const br = document.createElement('br');
            tabsContainer.appendChild(br);
          }
        });

        // Attaches click event listeners for each tab
    document.querySelectorAll('.planet-info-tabs').forEach(tab => {
    // Generates and stores the listener function
    tab._tabClickListener = createTabClickListener(planetName);
    tab.addEventListener('click', tab._tabClickListener);
  });
    }
  
  }else{
      // Creates singular tab for orbit details
      const p = document.createElement('p');
      p.textContent = "Orbit Details";
      p.className = 'planet-info-tabs'; // Use the class for styling
      tabsContainer.appendChild(p);
  }

  
}

// Allows for planet name event listener to be referenced
function createTabClickListener(planetName) {
  return function(event) {
    planetTabClickHandler(planetName, event);
  };
}

// Handles the event listener for when overlay div tab is clicked on
function planetTabClickHandler(planetName, event) {
  let targetElement = event.target;
  while (targetElement != null && !targetElement.classList.contains('planet-info-tabs')){
    targetElement = targetElement.parentElement;
  }

  if (targetElement) {
    const aspectName = targetElement.textContent;
    updatePlanetDescription(planetName, aspectName);
  }
}

// Updates the description text of overlay div
function updatePlanetDescription(planetName, aspectName){

  // Creates references to description & links html divs
  const descriptionContainer = document.getElementById('planet-description');
  const linksContainer = document.getElementById('planet-links');
  // Clears existing descriptions
  descriptionContainer.innerHTML = ''; 
  linksContainer.innerHTML = ''; 

  // Isolates object with appropriate description
  const descriptionFromObject = planetDescriptions[planetName.toLowerCase()].find(entry => entry.name === aspectName);

  // Sets overlay div description with appropriate description
  descriptionContainer.textContent = descriptionFromObject.description

  // Adds appropriate links for all aspects except planet summary
  if(aspectName != "summary"){
    // Sets appropriate link for aspect description
    const a = document.createElement('a');
    const urlFromObject = planetLinks[planetName.toLowerCase()].find(entry => entry.name === aspectName);
    a.href = urlFromObject.url;
    a.target = "_blank";
    a.textContent = urlFromObject.name + " ↗";
    a.className = "planet-info-links";
    linksContainer.appendChild(a);
  }
  

}

// Removes overlay div from display
function hideOverlay() {
  document.querySelectorAll('.planet-info-tabs').forEach(tab => {
    if (tab._tabClickListener) {
      tab.removeEventListener('click', tab._tabClickListener);
      // Optionally, clear the stored reference
      delete tab._tabClickListener;
    }
  });

  const overlay = document.getElementById('planet-info-overlay');
  overlay.style.display = 'none'; // Hide the overlay
  isOverlayUp = false;
}

// If planet has been clicked, tracks camera to the specified planet
function followPlanet(){
    if(clickedPlanet){
       // Define a fixed distance from the planet to the camera
       const distance = 10;

       // Calculate the direction vector from the camera to the planet
       const direction = new THREE.Vector3().subVectors(clickedPlanet.position, camera.position).normalize();

       // Calculate the new camera position with the specified distance
       const newPosition = new THREE.Vector3().addVectors(clickedPlanet.position, direction.multiplyScalar(-distance));

       // Set the camera to the new position
       camera.position.set(newPosition.x, newPosition.y, newPosition.z);

       // Make the camera look at the planet
       camera.lookAt(clickedPlanet.position);
    }else {
        // Reset the camera to the center of the scene
        resetPosition();
    }
}

// Sets all planets to the same orbital angle
function samePlanetAngles(){
  planets.mercury.start = sameAngleDegrees;
  planets.venus.start = sameAngleDegrees;
  planets.earth.start = sameAngleDegrees;
  planets.mars.start = sameAngleDegrees;
  planets.jupiter.start = sameAngleDegrees;
  planets.saturn.start = sameAngleDegrees;
  planets.uranus.start = sameAngleDegrees;
  planets.neptune.start = sameAngleDegrees;

}
// Sets all planets to random orbital angles
function randomizePlanetAngles(){
  planets.mercury.start = Math.random() * 360;
  planets.venus.start = Math.random() * 360;
  planets.earth.start = Math.random() * 360;
  planets.mars.start = Math.random() * 360;
  planets.jupiter.start = Math.random() * 360;
  planets.saturn.start = Math.random() * 360;
  planets.uranus.start = Math.random() * 360;
  planets.neptune.start = Math.random() * 360;
}
 // Toggles the planet menu
 function togglePlanetMenu() {
  // Creates reference to html div for planet menu
  var planetMenu = document.getElementById('planet-menu');
  var menuIcon = document.getElementById('menu-icon');

  // Transitions the planet menu from open to closed, or closed to open
  if (planetMenu.style.opacity === '0.6') {
      planetMenu.style.opacity = '0';
      planetMenu.style.right = '-12.5rem'; // Move the menu out of view
      menuIcon.style.display = 'block';

      setTimeout(() => { planetMenu.style.display = 'none'; }, 500); // Wait for the transition to finish before hiding
  } else {
      planetMenu.style.display = 'block';
      setTimeout(() => {
          planetMenu.style.opacity = '0.6';
          menuIcon.style.display = 'none';
          planetMenu.style.right = '0'; // Move the menu into view
          
      }, 10); // A slight delay to ensure the display property is applied before transitioning
  }
}

// Returns camera to center of the screen
function resetPosition(){
    if(returnToCenter){
        camera.position.set(0, 0, 5);
        returnToCenter = false;
    }else if(returnToBirdsEyeView){
      camera.position.copy(birdsEyeViewPosition);
      camera.rotation.copy(birdsEyeViewRotation);
      returnToBirdsEyeView = false;
    }
}

// Updates the positions of moving scene elements
function updateData(){
    // Rotates Mercury
    mercuryMesh.rotation.y += planets.mercury.rotationSpeed;
    // Moves Mercury
    planetPositions.mercury.x = Math.cos(planets.mercury.start) * planets.mercury.orbitRadius;
    planetPositions.mercury.z = Math.sin(planets.mercury.start) * planets.mercury.orbitRadius;
    mercuryMesh.position.set(planetPositions.mercury.x, 0, planetPositions.mercury.z);
    planets.mercury.start += planets.mercury.orbitSpeed;


    // Rotates Venus
    venusMesh.rotation.y += planets.venus.rotationSpeed;
    // Moves Venus
    planetPositions.venus.x = Math.cos(planets.venus.start) * planets.venus.orbitRadius;
    planetPositions.venus.z = Math.sin(planets.venus.start) * planets.venus.orbitRadius;
    venusMesh.position.set(planetPositions.venus.x, 0, planetPositions.venus.z);
    planets.venus.start += planets.venus.orbitSpeed;


    // Rotates Earth
    earthMesh.rotation.y += planets.earth.rotationSpeed;
    
    // Moves Earth
    planetPositions.earth.x = Math.cos(planets.earth.start) * planets.earth.orbitRadius;
    planetPositions.earth.z = Math.sin(planets.earth.start) * planets.earth.orbitRadius;
    earthMesh.position.set(planetPositions.earth.x, 0, planetPositions.earth.z);
    // earthLightsMesh.position.set(earthX, 0, earthZ);
    // earthCloudsMesh.position.set(earthX, 0, earthZ);
    planets.earth.start += planets.earth.orbitSpeed;


    // Rotates Mars
    marsMesh.rotation.y += planets.mars.rotationSpeed;
    // Moves Mars
    planetPositions.mars.x = Math.cos(planets.mars.start) * planets.mars.orbitRadius;
    planetPositions.mars.z = Math.sin(planets.mars.start) * planets.mars.orbitRadius;
    marsMesh.position.set(planetPositions.mars.x, 0, planetPositions.mars.z);
    planets.mars.start += planets.mars.orbitSpeed;

    // Rotates Jupiter
    jupiterMesh.rotation.y += planets.jupiter.rotationSpeed;
    // Moves Jupiter
    planetPositions.jupiter.x = Math.cos(planets.jupiter.start) * planets.jupiter.orbitRadius;
    planetPositions.jupiter.z = Math.sin(planets.jupiter.start) * planets.jupiter.orbitRadius;
    jupiterMesh.position.set(planetPositions.jupiter.x, 0, planetPositions.jupiter.z);
    planets.jupiter.start += planets.jupiter.orbitSpeed;

    // Rotates Saturn
    saturnMesh.rotation.y += planets.saturn.rotationSpeed;
    // Moves Saturn
    planetPositions.saturn.x = Math.cos(planets.saturn.start) * planets.saturn.orbitRadius;
    planetPositions.saturn.z = Math.sin(planets.saturn.start) * planets.saturn.orbitRadius;
    saturnMesh.position.set(planetPositions.saturn.x, 0, planetPositions.saturn.z);
    planets.saturn.start += planets.saturn.orbitSpeed;

    // Rotates Uranus
    uranusMesh.rotation.y += planets.uranus.rotationSpeed;
    // Moves Uranus
    planetPositions.uranus.x = Math.cos(planets.uranus.start) * planets.uranus.orbitRadius;
    planetPositions.uranus.z = Math.sin(planets.uranus.start) * planets.uranus.orbitRadius;
    uranusMesh.position.set(planetPositions.uranus.x, 0, planetPositions.uranus.z);
    planets.uranus.start += planets.uranus.orbitSpeed;

    // Rotates Neptune
    neptuneMesh.rotation.y += planets.neptune.rotationSpeed;
    // Moves Neptune
    planetPositions.neptune.x = Math.cos(planets.neptune.start) * planets.neptune.orbitRadius;
    planetPositions.neptune.z = Math.sin(planets.neptune.start) * planets.neptune.orbitRadius;
    neptuneMesh.position.set(planetPositions.neptune.x, 0, planetPositions.neptune.z);
    planets.neptune.start += planets.neptune.orbitSpeed;


    

    



   
    sunLight.position.copy(camera.position);
    

}

// Outlines all planet & paths traveled orbits
function outlineAllOrbits(){
  addPlanetAndPathTraveledOrbits(planets.mercury.orbitRadius, planets.mercury.orbitIncline, "orbit-mercury", "orbitInfo-mercury", "traveledPath-mercury", orbitColors.mercury.color);
  addPlanetAndPathTraveledOrbits(planets.venus.orbitRadius, planets.venus.orbitIncline, "orbit-venus", "orbitInfo-venus", "traveledPath-venus", orbitColors.venus.color);
  addPlanetAndPathTraveledOrbits(planets.earth.orbitRadius, planets.earth.orbitIncline, "orbit-earth", "orbitInfo-earth", "traveledPath-earth", orbitColors.earth.color);
  addPlanetAndPathTraveledOrbits(planets.mars.orbitRadius, planets.mars.orbitIncline, "orbit-mars", "orbitInfo-mars", "traveledPath-mars", orbitColors.mars.color);
  addPlanetAndPathTraveledOrbits(planets.jupiter.orbitRadius, planets.jupiter.orbitIncline, "orbit-jupiter", "orbitInfo-jupiter", "traveledPath-jupiter", orbitColors.jupiter.color);
  addPlanetAndPathTraveledOrbits(planets.saturn.orbitRadius, planets.saturn.orbitIncline, "orbit-saturn", "orbitInfo-saturn", "traveledPath-saturn", orbitColors.saturn.color);
  addPlanetAndPathTraveledOrbits(planets.uranus.orbitRadius, planets.uranus.orbitIncline, "orbit-uranus", "orbitInfo-uranus", "traveledPath-uranus", orbitColors.uranus.color);
  addPlanetAndPathTraveledOrbits(planets.neptune.orbitRadius, planets.neptune.orbitIncline, "orbit-neptune", "orbitInfo-neptune", "traveledPath-neptune", orbitColors.neptune.color);
  
}
// Removes all orbits outlines & text meshes from the scene
function removeAllOrbitAndTextMeshes(){
  // Removes all planet orbit outlines from scene. Disposes of all geometries and materials for planet orbit outlines.
  allOrbits.forEach(orbit => {
    scene.remove(orbit);

    orbit.geometry.dispose();

    orbit.material.dispose();
  });
  // Removes all text meshes from scene. Disposes of all geometries and materials for text meshes.
  textMeshes.forEach(textMesh =>{
    scene.remove(textMesh);

    textMesh.geometry.dispose();

    if (Array.isArray(textMesh.material)) {
      textMesh.material.forEach(material => material.dispose());
    } else {
      textMesh.material.dispose();
    }
  });
  // Removes all paths traveled orbit outlines from scene. Disposes of all geometries and materials for paths traveled orbit outlines.
  allTraveledPaths.forEach(orbit => {
    scene.remove(orbit);

    orbit.geometry.dispose();

    orbit.material.dispose();
  });

  // Clears all references to orbit outlines & text meshes
  allOrbits = [];
  textMeshes = [];
  allTraveledPaths = [];


}

// loads font into 3D scene
function loadFont(){
  const loaderFont = new FontLoader;
  loaderFont.load("fonts/spaceMono-Regular.json", function(font){
    loadedFont = font;
  })
  
}

// Initiates planet orbit & path traveled outlines
function addPlanetAndPathTraveledOrbits(orbitRadius, orbitIncline, orbitName, orbitInfoName, traveledPathName, traveledPathColor) {
  // Creates geometry for orbit outline
  const orbitGeometry = createOrbitGeometry(orbitRadius, 160);
  // Creates material for orbit outline
  const orbitMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
  }); 
  // Initiates orbit outline
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);

  // Inclines the orbit outline
  orbit.rotation.z = orbitIncline * Math.PI / 180;

  // Defines name property for the orbit outline
  orbit.name = orbitName;

  // Stores reference for the orbit outline
  allOrbits.push(orbit);
  // Adds orbit outline to the scene
  scene.add(orbit);




  // Creates material for path traveled outline
  const traveledPathMaterial = new THREE.LineBasicMaterial({ color: traveledPathColor });
  // Initiates path traveled outline
  const traveledPath = new THREE.Line(orbitGeometry, traveledPathMaterial);

  // Defines name property for the path traveled outline
  traveledPath.name = traveledPathName;

  // Inclines the path traveled outline
  traveledPath.rotation.z = orbitIncline * Math.PI / 180;

  // Stores reference for the path traveled outline
  allTraveledPaths.push(traveledPath);
  // Adds path traveled outline to the scene
  scene.add(traveledPath);

  // References geometry, orbit outline, & path traveled outline to respective planet meshes
  allPlanets.forEach(planet => {
      if (planet.name === orbitName.toLowerCase().replace("orbit-", "")){
        planet.orbit = orbit;
        planet.traveledPath = traveledPath;
        planet.orbitGeometry = orbitGeometry;
      }
  });


  // Initiates text mesh if font is properly loaded
  if (loadedFont) {
        // Defines text to inserted into scene
        const orbitalPeriod = orbitalPeriods[orbitName.toLowerCase().replace("orbit-", "")]?.years;

        // returns console error is text to be inserted is undefined
        if (orbitalPeriod === undefined) {
          console.error('Orbital period not found for', orbitName);
          return;
        }

        // Defines geometry of text mesh
        const textGeometry = new TextGeometry(orbitalPeriod, {
          font: loadedFont,
          size: 2, // Adjusted size for better visibility
          height: 0.1,
        });

        // Defines material of text mesh
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Initiates the text mesh
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Sets the position of the text mesh
        textMesh.position.set(orbitRadius, 0, 0); 

        // Rotates the text to face upwards
        textMesh.rotation.x = -Math.PI / 2;

        // Defines the name property of text mesh
        textMesh.name = orbitInfoName;

        // Stores reference of text mesh
        textMeshes.push(textMesh);

        // Adds text mesh to scene
        scene.add(textMesh);
  } else {
    // Returns error if font is not loaded
    console.error('Font not loaded');
  }
}

// Creates geometry for orbit outlines
function createOrbitGeometry(orbitRadius, segments = 64) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = orbitRadius * Math.cos(angle);
    const y = 0; // Assuming orbits are in the XZ plane
    const z = orbitRadius * Math.sin(angle);
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

// Updates the traveled path outline based on the planet's position
function updateTraveledPath(planetName) {

  // Defines variables required for path traveled calculation
  const planet = allPlanets.find(object => object.name === planetName);
  const planetMesh = planet; 
  const planetPosition = new THREE.Vector3();
  planetMesh.getWorldPosition(planetPosition);
  const orbitGeometry = planet.orbitGeometry;
  const positions = orbitGeometry.attributes.position.array;
  const vertexCount = positions.length / 3; // Each vertex has 3 values (x, y, z)

  // Calculates the angle and percent traveled
  const angle = Math.atan2(planetPosition.z, planetPosition.x);
  const normalizedAngle = angle >= 0 ? angle : (2 * Math.PI + angle);
  const percentTraveled = normalizedAngle / (2 * Math.PI);

  // Calculates the index up to which vertices should be considered as traveled
  const traveledIndex = Math.ceil(vertexCount * percentTraveled) * 3; // Multiply by 3 since each vertex consists of 3 values

  // Creates a new array for the traveled path's positions
  const traveledPositions = new Float32Array(traveledIndex);
  for (let i = 0; i < traveledIndex; i++) {
    traveledPositions[i] = positions[i];
  }

  // Updates the traveled path geometry
  const traveledGeometry = new THREE.BufferGeometry();
  traveledGeometry.setAttribute('position', new THREE.BufferAttribute(traveledPositions, 3));
  planet.traveledPath.geometry.dispose(); // Dispose of the old geometry
  planet.traveledPath.geometry = traveledGeometry;
}

// Tracks the position of the cursor
function onPointerMove( event ) {

	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;


}

// Initiates the planets into the scene
function initPlanets(){
    // Initiates all planets
    initMercury();
    initVenus();
    initEarth();
    initMars();
    initJupiter();
    initSaturn();
    initUranus();
    initNeptune();

    // Initiates planet Mercury
    function initMercury(){
      
      // Create a sphere geometry
      const mercuryGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      // Creates materials for Earth Mesh
      
      const mercuryMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/mercury/mercurymap.jpg"), 
        bumpMap: loader.load("images/mercury/mercurybump.jpg"),
        bumpScale: 0.04,
        });
        
        // Creates mesh with geometry and material
        mercuryMesh = new THREE.Mesh(mercuryGeometry, mercuryMat);
        mercuryMesh.name = "mercury";
        
        const mercuryGroup = new THREE.Group();
        mercuryGroup.name = "mercury";
        
        mercuryGroup.rotation.z = planets.mercury.orbitIncline * Math.PI/180;
        mercuryGroup.add(mercuryMesh);
        allPlanets.push(mercuryMesh);
        
      
        // Add the cube to the scene
        scene.add(mercuryGroup);
        
        // earthGroup.rotation.z = -23.4 * Math.PI / 180;

    
        
      
      
    }

    // Initiates planet Venus
    function initVenus(){
        
      // Create a sphere geometry
      const venusGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      
    
      // Creates materials for Earth Mesh
      
      const venusMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/venus/2234_venusmap2k.jpg"), 
        bumpMap: loader.load("images/venus/2234_venusbump2k.jpg"),
        bumpScale: 0.04,
      });
      
      // Creates mesh with geometry and material
      venusMesh = new THREE.Mesh(venusGeometry, venusMat);
      venusMesh.name = "venus";
      
      const venusGroup = new THREE.Group();
      venusGroup.name = "venus";

      venusGroup.rotation.z = planets.venus.orbitIncline * Math.PI/180;
      venusGroup.add(venusMesh);

      allPlanets.push(venusMesh);
      
      
    
      // Add the cube to the scene
      scene.add(venusGroup);
      // earthGroup.rotation.z = -23.4 * Math.PI / 180;
      
      
    }

    // Initiates planet Earth
    function initEarth(){
        
        // Create a sphere geometry
        const geometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
        // Creates materials for Earth Mesh
        
        const earthMat = new THREE.MeshPhongMaterial({
          map: loader.load("images/earth/8081_earthmap4k.jpg"),
          specularMap: loader.load("images/earth/8081_earthspec4k.jpg"), 
          bumpMap: loader.load("images/earth/8081_earthbump4k.jpg"),
          bumpScale: 0.04,
        });

        
        // const earthLightsMat = new THREE.MeshBasicMaterial({
        //   map: loader.load('images/earth/8081_earthlights4k.jpg'),
        //   blending: THREE.AdditiveBlending,
        //   // transparent: true,
        //   opacity: 0.8,
        // })
        // const earthCloudsMat = new THREE.MeshStandardMaterial({
        //   map: loader.load('images/earth/8081_earthclouds4k.jpg'),
        //   blending: THREE.AdditiveBlending,
        //   opacity: 0.6,
        // });
    
        // Creates mesh with geometry and material
        earthMesh = new THREE.Mesh(geometry, earthMat);
        earthMesh.name = "earth";
        
        // earthLightsMesh = new THREE.Mesh(geometry, earthLightsMat);
        // earthCloudsMesh = new THREE.Mesh(geometry, earthCloudsMat);
        // earthCloudsMesh.scale.setScalar(1.003);
        
        const earthGroup= new THREE.Group();
        earthGroup.name = "earth";
        
        earthGroup.rotation.z = planets.earth.orbitIncline * Math.PI/180;
        earthGroup.add(earthMesh);

        allPlanets.push(earthMesh);
        // earthGroup.add(earthLightsMesh);
        // earthGroup.add(earthCloudsMesh);
        
    
        // Add the cube to the scene
        scene.add(earthGroup);
        // earthGroup.rotation.z = -23.4 * Math.PI / 180;
    
        
        
    
        // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 1 );
        // scene.add(hemiLight);
    
        
    }

    // Initiates planet Mars
    function initMars(){
        
      // Create a sphere geometry
      const marsGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      
    
      // Creates materials for Mars Mesh
      
      const marsMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/mars/5672_mars_4k_color.jpg"), 
        bumpMap: loader.load("images/mars/5672_marsbump4k.jpg"),
        bumpScale: 0.04,
      });
      
      // Creates mesh with geometry and material
      marsMesh = new THREE.Mesh(marsGeometry, marsMat);
      marsMesh.name = "mars";

      // Creates group of all meshes
      const marsGroup = new THREE.Group();
      marsGroup.name = "mars";
      
      marsGroup.rotation.z = planets.mars.orbitIncline * Math.PI/180;
      marsGroup.add(marsMesh);

      allPlanets.push(marsMesh);
      
      
    
      // Adds Mars to the scene
      scene.add(marsGroup);
    
      
      
    }

    // Initiates planet Jupiter
    function initJupiter(){
        
      // Create a sphere geometry
      const jupiterGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      
    
      // Creates materials for Jupiter Mesh
      
      const jupiterMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/jupiter/jupitermap.jpg"), 
      });
      
      // Creates mesh with geometry and material
      jupiterMesh = new THREE.Mesh(jupiterGeometry, jupiterMat);
      jupiterMesh.name = "jupiter";
      
      // Creates group of all meshes
      const jupiterGroup = new THREE.Group();
      jupiterGroup.name = "jupiter";

      jupiterGroup.rotation.z = planets.jupiter.orbitIncline * Math.PI/180;
      jupiterGroup.add(jupiterMesh);
      
      allPlanets.push(jupiterMesh);
      
    
      // Adds Jupiter to the scene
      scene.add(jupiterGroup);
    
      
      
    }

    // Initiates planet Saturn
    function initSaturn(){
        
      // Create a sphere geometry
      const saturnGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      
    
      // Creates materials for Saturn Mesh
      
      const saturnMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/saturn/saturnmap.jpg"), 
      });
      
      // Creates mesh with geometry and material
      saturnMesh = new THREE.Mesh(saturnGeometry, saturnMat);
      saturnMesh.name = "saturn";
      
      // Creates group of all meshes
      const saturnGroup = new THREE.Group();
      saturnGroup.name = "saturn";

      saturnGroup.rotation.z = planets.saturn.orbitIncline * Math.PI/180;
      saturnGroup.add(saturnMesh);
      
      allPlanets.push(saturnMesh);
      
    
      // Adds Saturn to the scene
      scene.add(saturnGroup);
    
      
      
    }

    // Initiates planet Uranus
    function initUranus(){
        
      // Create a sphere geometry
      const uranusGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      
    
      // Creates materials for Uranus Mesh
      
      const uranusMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/uranus/uranusmap.jpg"), 
      });
      
      // Creates mesh with geometry and material
      uranusMesh = new THREE.Mesh(uranusGeometry, uranusMat);
      uranusMesh.name = "uranus";
      
      // Creates group of all meshes
      const uranusGroup = new THREE.Group();
      uranusGroup.name = "uranus";

      uranusGroup.rotation.z = planets.uranus.orbitIncline * Math.PI/180;
      uranusGroup.name = "uranus";
      uranusGroup.add(uranusMesh);

      allPlanets.push(uranusMesh);
      
      
    
      // Adds Uranus to the scene
      scene.add(uranusGroup);
    
      
      
    }

    // Initiates planet Neptune
    function initNeptune(){
        
      // Create a sphere geometry
      const neptuneGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
    
      
    
      // Creates materials for Neptune Mesh
      
      const neptuneMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/neptune/neptunemap.jpg"), 
      });
      
      // Creates mesh with geometry and material
      neptuneMesh = new THREE.Mesh(neptuneGeometry, neptuneMat);
      neptuneMesh.name = "neptune";
      
      // Creates group of all meshes
      const neptuneGroup = new THREE.Group();
      neptuneGroup.name = "neptune";

      neptuneGroup.rotation.z = planets.neptune.orbitIncline * Math.PI/180;
      neptuneGroup.add(neptuneMesh);

      allPlanets.push(neptuneMesh);
      
      
    
      // Adds Neptune to the scene
      scene.add(neptuneGroup);
    
      
      
    }

    
}

// Initiates the Sun into the scene
function initSun(){
      // Create a sphere geometry
      const sunGeometry = new THREE.IcosahedronGeometry(planetSize, 12);
        
      // Creates materials for Earth Mesh
      
      const sunMat = new THREE.MeshPhongMaterial({
        map: loader.load("images/sun/sunmap.jpg"),
      });

      

      // Creates mesh with geometry and material
      sunMesh = new THREE.Mesh(sunGeometry, sunMat);
      sunMesh.name = "sun";
      // Create the mesh and add it to the sunGroup or scene
      const sunGroup = new THREE.Group();
      sunGroup.name = "sun";
      
      sunGroup.add(sunMesh);
      

      // const sunFresnelMat = getFresnelMat();
      // const sunGlowMesh = new THREE.Mesh(sunGeometry, sunFresnelMat);
      // sunGlowMesh.scale.setScalar(1.01);
      
      
      
    
      // Add the cube to the scene
      scene.add(sunGroup);
      
      sun = sunGroup;
      // earthGroup.rotation.z = -23.4 * Math.PI / 180;

}

// Removes the Sun and reveals the stars in the scene
function removeSunRevealStars(){
  scene.children.forEach((child) =>{
    if(child.name === "stars"){
        child.visible = true;
    }
    if(child.name === "sun"){
          // Removes the object from the scene
          scene.remove(child);

          // Disposes of geometry
          if (child.geometry) {
              child.geometry.dispose();
          }

          // Disposes of material
          if (child.material) {
              // If the object has a material array, dispose of each material
              if (Array.isArray(child.material)) {
                  child.material.forEach(material => material.dispose());
              } else {
                  child.material.dispose();
              }
          }

          // Disposes of textures (if any)
          if (child.material && child.material.map) {
              child.material.map.dispose();
          }
          }
          });
}

// Increases the scale of all planets in the scene
function increaseScalePlanets(){
  for (var i=0; i < scene.children.length; i++) {
    if(scene.children[i].type === "Group"){
      for(const object of scene.children[i].children){
        if (object.material && object.name != "sun") {
          
          object.scale.set(increasedScale, increasedScale, increasedScale);

          } 
        }
      }
    }

};

// Returns the scale of all planets in the scene to normal
function decreaseScalePlanets(){
  
  
  
  for (var i=0; i < scene.children.length; i++) {
    if(scene.children[i].type === "Group"){
      for(const object of scene.children[i].children){
        if (object.material && object.name != "sun") {
          
          object.scale.set(baseScale, baseScale, baseScale);

          } 
        }
      }
    }



};


// Initiates the sunlight into the scene
function initSunlight(){
  // Initiates the sunlight
  const sunLight = new THREE.DirectionalLight(0xffffff);

  // Sets the initial positioning of the sunlight
  sunLight.position.set(0, 0, 5);

  // Creates reference for where the sunlight is pointing
  sunLight.target = new THREE.Object3D();

  // Adds sunlight & sunlight direction reference to the sunlight
  scene.add(sunLight);
  scene.add(sunLight.target);

  return sunLight;
}

// Initiates the Javascript 3D environment
function initScene(){
  // Initiates a scene
  const scene = new THREE.Scene();

  // Initiates a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Stores the initial position of the camera
  const initialCameraPosition = camera.position.clone();

  // Initiates the renderer
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Initiates texture loader
  const loader = new THREE.TextureLoader();

  // Renders into the html document
  document.body.appendChild(renderer.domElement);

  return {camera, renderer, scene, loader, initialCameraPosition};
}

// Resizes camera & renderer when viewport is resized
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initiates stars
// Code sourced from: https://github.com/bobbyroe/threejs-earth
function getStarfield({ numStars = 500} = {}) {

  function randomSpherePoint() {
    // Generate a radius that is outside of Neptune's orbit
    const radius = Math.random() * 500 + (planets.neptune.orbitRadius+100);
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  const verts = [];
  const colors = [];
  for (let i = 0; i < numStars; i += 1) {
    let pos = randomSpherePoint();
    let hue = 0.6; // Assuming a constant hue for all stars
    let col = new THREE.Color().setHSL(hue, 0.2, Math.random()); // Declare col here
    verts.push(pos.x, pos.y, pos.z);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 5, // Adjust size as needed
    vertexColors: true,
    map: new THREE.TextureLoader().load("images/circle.png"),
    transparent: true, // Set to true if your texture has transparency
  });

  const points = new THREE.Points(geo, mat);
  points.name = "stars"
  return points;
}












