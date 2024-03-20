

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// let frameCount = 0;
// const throttleInterval = 0; // Adjust the interval as needed

// initiates the three.js scene
const { camera, renderer, scene, loader, initialCameraPosition } = initScene();
// Positions the camera
camera.position.z = 5;
// Initiates the sunlight
const sunLight = initSunlight();


  
// Gets the camera position
const cameraPosition = camera.position;
var returnToCenter = false;


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var isMouseDown = false;
var navPass = false;
var isOverlayUp = false;

window.addEventListener('resize', onWindowResize);

document.addEventListener('click', function(event) {
    // Mouse button is pressed down
    isMouseDown = true;

    // Resets isMouseDown to false
    setTimeout(function() {
      isMouseDown = false;
    }, 10);
});
document.addEventListener( 'pointermove', onPointerMove );

document.getElementById('close-overlay').addEventListener('click', hideOverlay);

// Example planet objects setup
let planetOrbitInclines = {
  mercury: { name: "mercury", defaultOrbitIncline: 7.0 },
  venus: { name: "venus", defaultOrbitIncline: 3.395 },
  earth: { name: "earth", defaultOrbitIncline: 0 },
  mars: { name: "mars", defaultOrbitIncline: 1.848 },
  jupiter: { name: "jupiter", defaultOrbitIncline: 1.31},
  saturn: { name: "saturn", defaultOrbitIncline: 2.486},
  uranus: { name:"uranus", defaultOrbineIncline: 0.770},
  neptune: { name:"neptune", defaultOrbitIncline: 1.770}
};

let mercuryMesh;
let venusMesh;
let earthMesh, earthLightsMesh, earthCloudsMesh;
let marsMesh;
let jupiterMesh;
let saturnMesh;
let uranusMesh;
let neptuneMesh;

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
const planetSize = 4;
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
// ↗
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

let clickedPlanet = null;


// Initiates the stars
const stars = getStarfield();
scene.add(stars);

// Initiates the orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Initiates all planets
initPlanets();


// Populate the planet menu
const planetNames = Object.keys(planets);
const planetList = document.getElementById('planet-list');
planetNames.forEach(name => {
  const li = document.createElement('li');
  li.textContent =  name
  li.style.cursor = 'pointer';
  li.addEventListener('click', function() {
    

      for (var i=0; i < scene.children.length; i++){
          for(const object of scene.children[i].children){
            if(object.material){
              if (object.name === name) {
                navPass = true;
                clickPlanet(object);
              }
            } 
          }
      }
      // Close the menu after selection
      document.getElementById('planet-menu').style.display = 'none';
});
  
  planetList.appendChild(li);
});

document.addEventListener('DOMContentLoaded', function() {
 
     // Event listener for clicks on the document
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
console.log(scene.children);


// Call the render function to start rendering
render();


// Create a render function
function render() {
    // frameCount++;
    
    
    
  
    // if (frameCount % throttleInterval === 0) {
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( pointer, camera );
    
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );
    
    // Change color of intersected objects to red and reset others to white
    for (var i=0; i < scene.children.length; i++) {
      for(const object of scene.children[i].children){
        if (object.material) {
          const isIntersected = intersects.find(intersect => intersect.object === object);

          if (isIntersected && !isOverlayUp) {
            
            object.material.color.set(0xff0000); // Set color to red for intersected objects
            clickPlanet(object);
          
          } else {
            object.material.color.set(0xffffff); // Set color to white for non-intersected objects
          }
        }
      }
    }
    

    // frameCount = 0;
    // }
    // Update sunlight position to match camera position
    sunLight.position.copy(camera.position);

    // Calculate the forward direction of the camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // Calculate a target position based on the camera's forward direction
    const targetPosition = new THREE.Vector3().addVectors(camera.position, cameraDirection);

    // Update the sunlight to face the target position
    sunLight.target.position.copy(targetPosition);
    sunLight.target.updateMatrixWorld();

    followPlanet();
    // updateOverlayForPlanet(clickedPlanet);
    updateData();
    // Render the scene
    renderer.render(scene, camera);


    // Amimates the render
    requestAnimationFrame(render);
    
}
function clickPlanet(planet){
  if(isMouseDown || navPass){
      // Toggle the clickedPlanet state
      if(clickedPlanet === planet){

          
          clickedPlanet = null;
          returnToCenter = true;
          hideOverlay();

          // Show the intro text again
          document.getElementById('introText').style.display = 'block';

          navPass = false;
          
      } else {
          clickedPlanet = planet;
    
          showOverlayForPlanet(planet);

          
          
          // Hide the intro text
          document.getElementById('introText').style.display = 'none';
          
          navPass = false;
      }
  }
}

function showOverlayForPlanet(planet) {
    const overlay = document.getElementById('planet-info-overlay');
    const planetName = document.getElementById('planet-name');
    const descriptionContainer = document.getElementById('planet-description');

    // Find the description within the object for the given planet name
    const descriptionFromObject = planetDescriptions[planet.name.toLowerCase()].find(entry => entry.name === "summary");

 

    // Set the name and description based on the clicked planet
    planetName.textContent = planet.name; // Assuming the planet object has a 'name' property
    document.getElementById('planet-name').addEventListener('click', createNameClickListener(planet.name));

    setPlanetTabs(planet.name.toLowerCase());

    descriptionContainer.textContent = descriptionFromObject.description // Using the planetDescriptions object

    
    
    
    overlay.style.display = 'block'; // Show the overlay
    isOverlayUp = true;
}
function createNameClickListener(planetName) {
  // This function now directly handles clicks on the #planet-name element
  return function(event) {
    // Directly call the handler without searching the DOM
    planetNameClickHandler(planetName, event);
  };
}

function planetNameClickHandler(planetName, event){
  // Since #planet-name is unique, we directly use it without checking its class
  const aspectName = "summary";
  updatePlanetDescription(planetName, aspectName);
}
function setPlanetTabs(planetName) {
  const tabsContainer = document.getElementById('planet-tabs');
  tabsContainer.innerHTML = ''; // Clear existing links

  const aspects = planetDescriptions[planetName];
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
  
  
  }

  // Attach click event listeners to each tab
  document.querySelectorAll('.planet-info-tabs').forEach(tab => {
    // Generate and store the listener function
    tab._tabClickListener = createTabClickListener(planetName);
    tab.addEventListener('click', tab._tabClickListener);
  });
}
// Function to generate an event listener with parameters
function createTabClickListener(planetName) {
  return function(event) {
    planetTabClickHandler(planetName, event);
  };
}
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
function updatePlanetDescription(planetName, aspectName){


  const descriptionContainer = document.getElementById('planet-description');
  const linksContainer = document.getElementById('planet-links');
  descriptionContainer.innerHTML = ''; // Clear existing descriptions
  linksContainer.innerHTML = ''; 

  const descriptionFromObject = planetDescriptions[planetName.toLowerCase()].find(entry => entry.name === aspectName);

  descriptionContainer.textContent = descriptionFromObject.description // Using the planetDescriptions object

  if(aspectName != "summary"){
    const a = document.createElement('a');
    const urlFromObject = planetLinks[planetName.toLowerCase()].find(entry => entry.name === aspectName);
    a.href = urlFromObject.url;
    a.target = "_blank";
    a.textContent = urlFromObject.name + " ↗";
    a.className = "planet-info-links";
    linksContainer.appendChild(a);
  }
  

}
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

       
      
      //  camera.rotation._z = clickedPlanet.name.toLowerCase().orbitIncline * Math.PI/180;

       // Make the camera look at the planet
       camera.lookAt(clickedPlanet.position);
    }else {
        // Reset the camera to the center of the scene
        resetPosition();
    
    }
}
 // Function to toggle the planet menu
 function togglePlanetMenu() {
  var planetMenu = document.getElementById('planet-menu');
  if (planetMenu.style.opacity === '0.6') {
      planetMenu.style.opacity = '0';
      planetMenu.style.right = '-12.5rem'; // Move the menu out of view
      setTimeout(() => { planetMenu.style.display = 'none'; }, 500); // Wait for the transition to finish before hiding
  } else {
      planetMenu.style.display = 'block';
      setTimeout(() => {
          planetMenu.style.opacity = '0.6';
          planetMenu.style.right = '0'; // Move the menu into view
      }, 10); // A slight delay to ensure the display property is applied before transitioning
  }
}
function resetPosition(){
    if(returnToCenter){
        camera.position.set(0, 0, 5);
        returnToCenter = false;
    }
}
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
    // earthLightsMesh.rotation.y += planets.earth.rotationSpeed;
    // earthCloudsMesh.rotation.y += planets.earth.rotationSpeed;
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
function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  
}
function initPlanets(){
    initMercury();
    initVenus();
    initEarth();
    initMars();
    initJupiter();
    initSaturn();
    initUranus();
    initNeptune();
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
        
        mercuryGroup.rotation.z = planets.mercury.orbitIncline * Math.PI/180;
        mercuryGroup.add(mercuryMesh);
        
        
      
        // Add the cube to the scene
        scene.add(mercuryGroup);
        // earthGroup.rotation.z = -23.4 * Math.PI / 180;

    
        
      
      
    }
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
      venusGroup.rotation.z = planets.venus.orbitIncline * Math.PI/180;
      venusGroup.add(venusMesh);
      
      
    
      // Add the cube to the scene
      scene.add(venusGroup);
      // earthGroup.rotation.z = -23.4 * Math.PI / 180;
      
      
    }
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
        
        earthGroup.rotation.z = planets.earth.orbitIncline * Math.PI/180;
        earthGroup.add(earthMesh);
        // earthGroup.add(earthLightsMesh);
        // earthGroup.add(earthCloudsMesh);
        
    
        // Add the cube to the scene
        scene.add(earthGroup);
        // earthGroup.rotation.z = -23.4 * Math.PI / 180;
    
        
        
    
        // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 1 );
        // scene.add(hemiLight);
    
        
    }
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
      
      marsGroup.rotation.z = planets.mars.orbitIncline * Math.PI/180;
      marsGroup.add(marsMesh);
      
      
    
      // Adds Mars to the scene
      scene.add(marsGroup);
    
      
      
    }
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
      jupiterGroup.rotation.z = planets.jupiter.orbitIncline * Math.PI/180;
      jupiterGroup.add(jupiterMesh);
      
      
    
      // Adds Jupiter to the scene
      scene.add(jupiterGroup);
    
      
      
    }
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
      saturnGroup.rotation.z = planets.saturn.orbitIncline * Math.PI/180;
      saturnGroup.add(saturnMesh);
      
      
    
      // Adds Saturn to the scene
      scene.add(saturnGroup);
    
      
      
    }
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
      uranusGroup.rotation.z = planets.uranus.orbitIncline * Math.PI/180;
      uranusGroup.name = "uranus";
      uranusGroup.add(uranusMesh);
      
      
    
      // Adds Uranus to the scene
      scene.add(uranusGroup);
    
      
      
    }
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
      
      
    
      // Adds Neptune to the scene
      scene.add(neptuneGroup);
    
      
      
    }
}
function initSunlight(){
  const sunLight = new THREE.DirectionalLight(0xffffff);
  sunLight.position.set(0, 0, 5);
  sunLight.target = new THREE.Object3D(); // Add this line
  scene.add(sunLight);
  scene.add(sunLight.target); // And this line
  return sunLight;
}
function initScene(){
  // Initiates a scene
  const scene = new THREE.Scene();

  // Initiates a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function getStarfield({ numStars = 500} = {}) {
  // Adjust the neptuneOrbitRadius to match the scale of your scene

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
  return points;
}












