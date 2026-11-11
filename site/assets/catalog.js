// Fictional titles, personal ratings and media specifications for display only.
// A local static module, not an API client or a collection of video URLs.
export const categories = {
  movies: { title: "Movies", english: "MOVIES", description: "Stories worth keeping. A collection made for the big screen.", icon: "film" },
  series: { title: "TV Shows", english: "TV SERIES", description: "Some stories deserve another episode.", icon: "tv" },
  documentaries: { title: "Documentaries", english: "DOCUMENTARIES", description: "A different perspective. A world waiting to be discovered.", icon: "leaf" },
};

const entries = [
  ["wanderer","The Wanderer","THE WANDERER","movies",0,2025,["Sci-Fi","Adventure"],148,9.1,78.4,75.8,"4K","HDR10+","After the last beacon falls silent, a lone explorer crosses an endless sea of red sand. Beneath unfamiliar stars, the journey home becomes a search for something far greater than a planet."],
  ["deep-blue","Echoes of the Blue","ECHOES OF THE BLUE","movies",1,2025,["Adventure","Drama"],126,8.8,65.2,69.1,"4K","Dolby Vision","A mysterious sound from the deep draws an oceanographer back to the waters that changed her life. Far below the reach of sunlight, an unanswered echo is still waiting."],
  ["rain-letter","Letters in the Rain","LETTERS IN THE RAIN","movies",2,2024,["Mystery","Drama"],118,8.5,57.6,65.1,"4K","HDR10","An unsigned letter leads a woman back to a street where the rain never seems to stop. Behind every illuminated window, a different version of that night is waiting to be told."],
  ["last-orbit","The Last Orbit","THE LAST ORBIT","movies",3,2025,["Sci-Fi","Drama"],156,9,86.3,73.8,"4K","Dolby Vision","The last space station above Earth is losing power. Its two remaining crew members must choose between following a silent command and sending the message they were never meant to deliver."],
  ["midnight-train","Midnight Express","MIDNIGHT EXPRESS","movies",4,2024,["Mystery","Thriller"],132,8.6,68.1,68.8,"4K","HDR10+","At midnight, a train arrives at a station that appears on no map. When time outside the windows comes to a stop, every one-way ticket begins pointing toward the same secret."],
  ["mistwood","Into the Mist","INTO THE MIST","movies",5,2023,["Fantasy","Adventure"],141,8.7,72.8,68.9,"4K","HDR10","An old map, a missing expedition, and a forest that changes its paths. Following her father's marks, a young cartographer enters a world no one has ever charted."],
  ["sunset-route","The Golden Route","THE GOLDEN ROUTE","movies",6,2024,["Adventure","Drama"],116,8.3,59.7,68.6,"4K","HDR10","A retired pilot takes his old aircraft across a chain of islands to finish a flight abandoned years ago. An unexpected passenger gives the long sunset a new destination."],
  ["northern-guest","A Northern Guest","A NORTHERN GUEST","movies",7,2024,["Drama","Mystery"],129,8.9,69.2,71.5,"4K","Dolby Vision","As the polar night approaches, a stranger arrives in a remote coastal town. With the harbor slowly freezing over, the stories its residents agreed to forget begin rising to the surface."],
  ["silent-peaks","The Silent Peaks","THE SILENT PEAKS","movies",8,2023,["Adventure","Drama"],137,9.2,83.6,81.4,"4K","HDR10+","Two climbers reunite above the snow line after years apart. When a storm erases the way back, they must confront the decision neither has ever spoken about."],
  ["neon-end","Beyond the Neon","BEYOND THE NEON","movies",9,2025,["Sci-Fi","Crime"],134,8.4,76.9,76.5,"4K","Dolby Vision","In a city that never switches off its lights, memories are a currency. A memory restorer searching for her lost past receives a strange assignment bearing her own name."],
  ["between-tides","Between the Tides","BETWEEN THE TIDES","movies",10,2022,["Drama","Mystery"],122,8.6,62.5,68.3,"4K","HDR10","A lighthouse keeper begins his final watch before storm season. Unfamiliar lights beyond the harbor seem to repeat a pattern from a long-forgotten captain's journal."],
  ["seventh-summer","The Seventh Summer","THE SEVENTH SUMMER","movies",11,2023,["Romance","Drama"],109,8.2,26.8,32.8,"1080P","SDR","Seven years later, she returns to a seaside town to sell her grandmother's house. Summer stretches on, and the people she left behind still remember the words she never said."],
  ["long-street","The Long Street","THE LONG STREET","series",0,2025,["Mystery","Crime"],48,9.1,428.6,66.1,"4K","Dolby Vision","A disappearance connects the strangers who share one old street. A detective, a reporter, and a record-shop owner follow three different truths through the same rainy season.",12],
  ["red-frontier","Red Frontier","RED FRONTIER","series",1,2024,["Western","Adventure"],55,8.8,312.4,78.9,"4K","HDR10+","A frontier railway reaches the end of the canyon, and a small town loses its peace. The mail rider brings more than distant letters: he carries the past everyone hoped to escape.",8],
  ["tomorrow-files","The Tomorrow Files","THE TOMORROW FILES","series",2,2025,["Sci-Fi","Mystery"],52,9,356.8,91.5,"4K","Dolby Vision","An archive preserves every ordinary day in a seemingly perfect city, except yesterday. Its new caretaker discovers that the destroyed files describe events that have yet to happen.",10],
  ["winter-hotel","The Winter Hotel","THE WINTER HOTEL","series",3,2024,["Drama","Mystery"],46,8.7,268.4,81,"4K","HDR10","Heavy snow strands six final guests in a hotel about to close for good. When the radio broadcasts a missing-person notice, everyone turns toward the one unoccupied room.",8],
  ["coastline","The Coastline","THE COASTLINE","series",4,2023,["Drama","Romance"],44,8.4,186.2,47,"4K","HDR10","Three friends travel south along a winding coastal road. Every unexpected encounter takes them further from their planned destination and closer to who they want to become.",10],
  ["night-signal","The Night Signal","THE NIGHT SIGNAL","series",5,2025,["Mystery","Drama"],50,8.9,284.1,84.2,"4K","Dolby Vision","At three in the morning, a long-retired aircraft requests permission to land. A new air-traffic controller finds her voice repeating the exchange on a decades-old recording.",8],
  ["valley-echo","Echoes in the Valley","ECHOES IN THE VALLEY","series",6,2024,["Mystery","Drama"],47,8.6,198.5,93.8,"4K","HDR10+","An investigator returns to the valley where she grew up to find a missing ranger. Familiar faces offer warm welcomes, but nobody will discuss the light that went out on the mountain.",6],
  ["unsent-letters","Letters Never Sent","LETTERS NEVER SENT","series",7,2022,["Drama","Family"],42,8.5,96.4,30.6,"1080P","SDR","While clearing her mother's apartment, a daughter finds letters spanning thirty years. Following the addresses on the envelopes reveals a family history she was never told.",10],
  ["wild-earth","The Wild Earth","THE WILD EARTH","documentaries",8,2025,["Nature","Geography"],58,9.6,216.4,82.9,"4K","Dolby Vision","From golden savannas to untouched ice fields, follow the seasons and the paths of migration. An intimate journey into the lives that flourish beyond the human horizon.",6],
  ["beneath-blue","Beneath the Blue","BENEATH THE BLUE","documentaries",9,2024,["Nature","Ocean"],54,9.4,184.2,94.8,"4K","HDR10+","Leave the sunlit shallows behind and descend into a slowly glowing universe. In the enduring dark, deep-sea life finds astonishing ways to connect, survive, and thrive.",4],
  ["microcosmos","The Invisible World","THE INVISIBLE WORLD","documentaries",10,2023,["Science","Nature"],49,9,64.8,43.9,"1080P","SDR","A drop of water, a leaf, a grain of sand. Explore the intricate structures, surprising patterns, and extraordinary life hidden in the smallest corners of the everyday world.",4],
  ["night-lights","Lights of the Night","LIGHTS OF THE NIGHT","documentaries",11,2024,["Nature","Astronomy"],62,9.3,32.6,70.1,"1080P","SDR","When our own lights fade, another landscape begins to appear. From auroras to distant galaxies, a photographer follows the faint light traveling through the longest nights."],
];

export const catalog = entries.map((entry, index) => {
  const [id, title, english, category, art, year, genres, minutes, rating, size, bitrate, quality, hdr, synopsis, episodes] = entry;
  return {
    id, title, english, category, art, year, genres, minutes, rating, size, bitrate, quality, hdr, synopsis, episodes,
    atlas: category === "movies" ? "films" : "series",
    codec: quality === "4K" ? "HEVC / H.265" : "AVC / H.264",
    audio: quality === "4K" ? "TrueHD 7.1 · Dolby Atmos" : "DTS-HD MA 5.1",
    edition: quality === "4K" ? "UHD Blu-ray REMUX" : "Blu-ray REMUX",
    added: entries.length - index,
  };
});

export const findMedia = (id) => catalog.find((item) => item.id === id);
