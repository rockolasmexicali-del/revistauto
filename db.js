const APP_VERSION = "1.9.8"; // Incrementa este valor cada vez que actualices el catálogo o estructura

const defaultCatalogData = {
    makes: [
        'Acura', 'Alfa Romeo', 'Aprilia', 'Aston Martin', 'Audi', 'BAIC', 'Bajaj', 'Bentley',
        'BMW', 'Buick', 'BYD', 'Cadillac', 'Can-Am', 'CFMoto', 'Changan', 'Chevrolet', 'Chirey',
        'Chrysler', 'Cupra', 'Dodge', 'Ducati', 'Ferrari', 'Fiat', 'Ford', 'Foton', 'Freightliner', 'Genesis',
        'GMC', 'GWM', 'Harley-Davidson', 'Hero', 'Hino', 'Honda', 'Hummer', 'Hyundai', 'Indian Motorcycle',
        'Infiniti', 'International', 'Isuzu', 'Italika', 'JAC', 'JAECOO', 'Jaguar', 'Jeep', 'Jetour', 'Kawasaki',
        'Kenworth', 'Kia', 'KTM', 'Kymco', 'Land Rover', 'Lexus', 'Lincoln', 'Lucid', 'Mack', 'Maserati',
        'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'MINI', 'Mitsubishi', 'Nissan', 'Omoda',
        'Peugeot', 'Peterbilt', 'Polaris', 'Polestar', 'Pontiac', 'Porsche', 'Ram', 'Renault', 'Rivian',
        'Royal Enfield', 'Saturn', 'Scania', 'Scion', 'Sea-Doo', 'SEAT', 'Subaru', 'Suzuki', 'Tesla',
        'Toyota', 'Triumph', 'TVS', 'Veloci', 'Vento', 'Volkswagen', 'Volvo', 'Yamaha'
    ],
    modelsByMake: {
        'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'Integra', 'NSX', 'ZDX'],
        'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', '4C', 'Giulietta', 'Mito'],
        'Aprilia': ['RS 660', 'Tuono V4', 'SR GT', 'RSV4', 'Tuareg 660', 'SXR 160'],
        'Aston Martin': ['Vantage', 'DB11', 'DBS', 'DBX', 'DB12', 'Rapide'],
        'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'R8'],
        'BAIC': ['X35', 'BJ40', 'X55', 'D20', 'X25'],
        'Bajaj': ['Pulsar NS200', 'Pulsar N250', 'Dominar 400', 'Platina 110', 'Avenger 220', 'Boxer 150', 'Chetak', 'Pulsar 150', 'Discover 125'],
        'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga', 'Mulsanne'],
        'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'i4', 'iX', 'M3', 'M4', 'M5', 'R 1250 GS', 'R 1300 GS', 'S 1000 RR', 'G 310 R', 'F 850 GS'],
        'Buick': ['Encore', 'Envision', 'Enclave', 'Regal', 'Verano', 'LaCrosse'],
        'BYD': ['Dolphin', 'Seal', 'Yuan Plus', 'Han', 'Tang', 'Song Plus', 'Seagull', 'King'],
        'Cadillac': ['XT4', 'XT5', 'XT6', 'Escalade', 'CT4', 'CT5', 'Lyriq', 'CTS'],
        'Can-Am': ['Maverick X3', 'Defender', 'Outlander', 'Renegade', 'Commander', 'Spyder', 'Ryker'],
        'CFMoto': ['450SR', '650NK', '800NK', '300NK', 'CFORCE 450', 'CFORCE 600', 'CFORCE 1000', 'UFORCE 1000', 'ZFORCE 950'],
        'Changan': ['Alsvin', 'CS35 Plus', 'CS55 Plus', 'CS75 Plus', 'UNI-K', 'UNI-T', 'Hunter'],
        'Chevrolet': ['Aveo', 'Beat', 'Cheyenne', 'Silverado', 'Trax', 'Captiva', 'Tracker', 'Suburban', 'Tahoe', 'Equinox', 'Colorado', 'Blazer', 'Cavalier', 'Onix', 'S10', 'Tornado', 'Camaro', 'Corvette', 'Cruze', 'Spark', 'Malibu', 'Express', 'Groove', 'Montana'],
        'Chirey': ['Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Omoda 5', 'Arrizo 8'],
        'Chrysler': ['300', 'Pacifica', 'Voyager', 'Town & Country', '200', 'Aspen', 'PT Cruiser'],
        'Cupra': ['Formentor', 'Leon', 'Ateca', 'Born', 'Tavascan'],
        'Dodge': ['Attitude', 'Charger', 'Challenger', 'Durango', 'Journey', 'Neon', 'Dart', 'Ram 1500', 'Viper', 'Grand Caravan'],
        'Ducati': ['Panigale V4', 'Monster', 'Multistrada', 'Scrambler', 'Streetfighter V4', 'Diavel 1260', 'Hypermotard', 'DesertX'],
        'Ferrari': ['488', 'F8 Tributo', 'Roma', 'SF90 Stradale', 'Portofino', '812 Superfast', '296 GTB', 'Purosangue', '458 Italia', 'California'],
        'Fiat': ['Mobi', 'Argo', 'Fastback', 'Pulse', '500', 'Uno', 'Strada', 'Ducato', 'Palio', 'Siena'],
        'Ford': ['Mustang', 'Lobo', 'Ranger', 'Explorer', 'Figo', 'F-150', 'F-250', 'F-350', 'F-450', 'F-550', 'Bronco', 'Edge', 'Expedition', 'Escape', 'Transit', 'Territory', 'Maverick', 'Focus', 'Fiesta', 'Fusion', 'EcoSport'],
        'Foton': ['Auman', 'Aumark', 'Tunland', 'View CS2', 'Gratour', 'Toano'],
        'Freightliner': ['Cascadia', 'M2 106', 'Columbia', 'FLD', 'Business Class M2', 'Coronado', '114SD', 'Century Class', 'Cascadia EV'],
        'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'],
        'GMC': ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Canyon', 'Savana', 'Hummer EV'],
        'GWM': ['Haval H6', 'Haval Jolion', 'Ora 03', 'Tank 300', 'Poer'],
        'Harley-Davidson': ['Sportster S', 'Iron 883', 'Street Glide', 'Road Glide', 'Fat Boy', 'Heritage Classic', 'Pan America 1250', 'Softail', 'Road King', 'Breakout', 'Nightster'],
        'Hero': ['Thruster', 'Hunk 160R', 'Xpulse 200', 'Dash 125', 'Eco 150'],
        'Hino': ['300 Series', '500 Series', '195', '268', '338', 'L6', 'L7', 'XL7', 'XL8'],
        'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'BR-V', 'Odyssey', 'City', 'Fit', 'Ridgeline', 'WR-V', 'CBR600RR', 'CBR1000RR', 'CRF250L', 'XR150L', 'NAVI', 'Dio 110', 'CB190R'],
        'Hummer': ['H1', 'H2', 'H3', 'EV'],
        'Hyundai': ['Grand i10', 'Elantra', 'Accent', 'Creta', 'Tucson', 'Santa Fe', 'Sonata', 'Kona', 'Palisade', 'Venue', 'Staria', 'Veloster', 'Ioniq 5'],
        'Indian Motorcycle': ['Scout', 'Chief', 'FTR 1200', 'Challenger', 'Roadmaster', 'Chieftain'],
        'Infiniti': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80', 'G37'],
        'International': ['ProStar', 'LT Series', 'LoneStar', 'MV Series', 'WorkStar', 'Durastar', 'TransStar', '4300', '9400', 'HX Series', 'RH Series'],
        'Isuzu': ['NPR', 'NQR', 'NRR', 'FTR', 'FVR', 'ELF 200', 'ELF 300', 'ELF 400', 'ELF 500', 'ELF 600', 'D-Max', 'Forward', 'Rodeo'],
        'Italika': ['FT125', 'FT150', 'DM200', 'DM250', 'VX250', 'WS150', 'Vortex 300', 'Vort-X 200', 'AT110', 'D125', 'RT200', 'FT250TS', 'SPTFIRE', 'Modena 175'],
        'JAC': ['Frison T6', 'Frison T8', 'Sei 2', 'Sei 3', 'Sei 4 Pro', 'Sunray', 'X200', 'E10X', 'J7'],
        'JAECOO': ['J7', 'J8'],
        'Jaguar': ['F-PACE', 'E-PACE', 'I-PACE', 'F-TYPE', 'XE', 'XF', 'XJ'],
        'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Commander', 'Wagoneer', 'Liberty', 'Patriot'],
        'Jetour': ['Dashing', 'X70', 'X70 Plus', 'X90 Plus'],
        'Kawasaki': ['Ninja 400', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Z650', 'Z900', 'Versys 650', 'KX250', 'Mule', 'Teryx', 'KLX300', 'KLR650', 'Ninja 650'],
        'Kenworth': ['T680', 'T880', 'W900', 'K270', 'K370', 'T370', 'T470', 'T270', 'T380', 'T480', 'W990', 'T180', 'T280'],
        'Kia': ['Rio', 'Forte', 'Sportage', 'Sorento', 'Soul', 'Seltos', 'K3', 'Sonet', 'Telluride', 'Stinger', 'Carnival', 'Optima', 'Niro'],
        'KTM': ['200 Duke', '390 Duke', '890 Duke', '1290 Super Duke R', '390 Adventure', '890 Adventure', 'RC 390', '250 EXC'],
        'Kymco': ['Agility 125', 'Like 150', 'Downtown 350', 'AK 550', 'Super 8'],
        'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Defender', 'Discovery', 'Discovery Sport', 'LR4'],
        'Lexus': ['IS', 'ES', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'RC'],
        'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator', 'MKZ', 'MKX', 'MKC'],
        'Lucid': ['Air', 'Gravity'],
        'Mack': ['Anthem', 'Pinnacle', 'Granite', 'LR', 'TerraPro', 'Super-Liner', 'MD Series'],
        'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'MC20', 'GranTurismo'],
        'Mazda': ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-90', 'MX-5 Miata', 'CX-9', 'CX-7'],
        'McLaren': ['720S', '750S', 'Artura', 'GT', '570S', 'Senna', '650S'],
        'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'Clase S', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Clase G', 'Sprinter', 'Actros', 'Atego', 'Axor', 'CLA', 'CLS'],
        'MG': ['MG GT', 'MG5', 'ZS', 'HS', 'RX5', 'ONE', 'MG4 EV', 'MG3'],
        'MINI': ['Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Paceman'],
        'Mitsubishi': ['Mirage G4', 'Outlander', 'L200', 'Montero Sport', 'Eclipse Cross', 'ASX', 'Lancer'],
        'Nissan': ['Versa', 'Sentra', 'March', 'Frontier', 'NP300', 'Kicks', 'X-Trail', 'Altima', 'Pathfinder', 'Armada', 'Note', 'Maxima', 'Urvan', '370Z', 'GT-R', 'Tiida', 'Juke', 'Murano', 'Z', 'V-Drive'],
        'Omoda': ['Omoda C5', 'Omoda O5', 'Omoda O5 GT'],
        'Peugeot': ['208', '301', '2008', '3008', '5008', 'Partner', 'Manager', 'Expert', 'Rifter', '308', '508'],
        'Peterbilt': ['389', '579', '567', '337', '348', '520', '379', '589', '536', '548', '220', '365', '367'],
        'Polaris': ['RZR', 'RZR XP 1000', 'RZR Turbo R', 'Ranger', 'General', 'Sportsman', 'Scrambler', 'Slingshot'],
        'Polestar': ['Polestar 2', 'Polestar 3', 'Polestar 4'],
        'Pontiac': ['G6', 'Grand Am', 'Firebird', 'GTO', 'Solstice', 'Matiz', 'Sunfire', 'Grand Prix', 'Torrent'],
        'Porsche': ['718 Boxster', '718 Cayman', '911', 'Taycan', 'Panamera', 'Macan', 'Cayenne'],
        'Ram': ['700', '1500', '2500', '3500', '4000', '4500', '5500', 'ProMaster', 'ProMaster Rapid', 'Heavy Duty', 'Rampage'],
        'Renault': ['Kwid', 'Stepway', 'Duster', 'Captur', 'Koleos', 'Kangoo', 'Oroch', 'Master', 'Logan', 'Clio', 'Megane'],
        'Rivian': ['R1T', 'R1S'],
        'Royal Enfield': ['Classic 350', 'Meteor 350', 'Himalayan', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650'],
        'Saturn': ['Vue', 'Ion', 'Aura', 'Sky', 'Outlook'],
        'Scania': ['Serie R', 'Serie S', 'Serie G', 'Serie P', 'Serie L'],
        'Scion': ['tC', 'xB', 'FR-S', 'xD', 'xA'],
        'Sea-Doo': ['Spark', 'GTI', 'GTX', 'RXT', 'Wake', 'Switch', 'FishPro'],
        'SEAT': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Toledo', 'Altea'],
        'Subaru': ['Impreza', 'WRX', 'BRZ', 'Crosstrek', 'Forester', 'Outback', 'Ascent', 'Legacy'],
        'Suzuki': ['Ignis', 'Swift', 'Baleno', 'Ertiga', 'Jimny', 'Vitara', 'S-Cross', 'Grand Vitara', 'AX100', 'GSX-R600', 'V-Strom 650', 'KingQuad 750', 'Boulevard', 'Gixxer 150', 'Intruder', 'Burgman 125', 'Hayabusa'],
        'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
        'Toyota': ['Yaris', 'Corolla', 'Camry', 'Prius', 'Avanza', 'Corolla Cross', 'RAV4', 'Highlander', 'Sienna', 'Hilux', 'Tacoma', 'Tundra', '4Runner', 'Sequoia', 'Supra', 'Land Cruiser', 'Hiace', 'C-HR', 'GR86', 'Raize', 'Rush'],
        'Triumph': ['Street Triple', 'Bonneville', 'Tiger 900', 'Trident 660', 'Speed Triple', 'Scrambler 1200', 'Rocket 3'],
        'TVS': ['Apache RTR 200', 'NTorq 125', 'Raider 125', 'Sport 100', 'Star City'],
        'Veloci': ['Razzer 200', 'Hasport 250', 'Xeverus 250', 'Stealth 200', 'Aggressor 250', 'Boxer 150'],
        'Vento': ['Nitrox 250', 'Hyper 280', 'Crossmax 250', 'Screamer 250', 'Rocketman 250', 'Falkon 200', 'Workman 250', 'Alpina 300', 'Storm 250', 'Lithium 150'],
        'Volkswagen': ['Polo', 'Vento', 'Virtus', 'Jetta', 'Golf', 'Nivus', 'T-Cross', 'Taos', 'Tiguan', 'Teramont', 'Atlas', 'Amarok', 'Saveiro', 'Transporter', 'Crafter', 'Beetle', 'Passat', 'Golf GTI', 'Derby', 'CrossFox', 'Pointer', 'Bora', 'Touareg'],
        'Volvo': ['S60', 'S90', 'V60', 'XC40', 'XC60', 'XC90', 'C40', 'VNL', 'VNR', 'FH', 'FM', 'EX30'],
        'Yamaha': ['R6', 'MT-07', 'Fz-S', 'YZF-R1', 'Tenere 700', 'NMAX', 'R3', 'YFZ450R', 'Grizzly 700', 'Raptor 700', 'YXZ1000R', 'Crypton 110', 'YBR125', 'MT-09', 'MT-03', 'XMAX', 'Aerox 155', 'Tracer 9']
    },
    modelsByTypeAndMake: {
        'Pickup': {
            'Ford': ['Lobo', 'Ranger', 'F-150', 'F-250', 'F-350', 'F-450', 'F-550', 'Maverick'],
            'Chevrolet': ['Cheyenne', 'Silverado', 'Colorado', 'S10', 'Tornado', 'Montana'],
            'Toyota': ['Hilux', 'Tacoma', 'Tundra'],
            'Nissan': ['Frontier', 'NP300'],
            'Ram': ['700', '1500', '2500', '3500', '4000', '4500', '5500', 'Heavy Duty', 'Rampage'],
            'Volkswagen': ['Amarok', 'Saveiro'],
            'GMC': ['Sierra', 'Canyon'],
            'Dodge': ['Ram 1500'],
            'Jeep': ['Gladiator'],
            'Mitsubishi': ['L200'],
            'Renault': ['Oroch'],
            'JAC': ['Frison T6', 'Frison T8'],
            'GWM': ['Poer'],
            'Changan': ['Hunter'],
            'Foton': ['Tunland'],
            'Isuzu': ['D-Max', 'Rodeo'],
            'Rivian': ['R1T'],
            'Tesla': ['Cybertruck']
        },
        'Sedán': {
            'Ford': ['Fusion', 'Focus', 'Fiesta', 'Figo'],
            'Chevrolet': ['Aveo', 'Beat', 'Cavalier', 'Onix', 'Cruze', 'Spark', 'Malibu'],
            'Toyota': ['Yaris', 'Corolla', 'Camry', 'Prius'],
            'Nissan': ['Versa', 'Sentra', 'Altima', 'Maxima', 'Tiida', 'V-Drive'],
            'Volkswagen': ['Vento', 'Virtus', 'Jetta', 'Passat', 'Derby', 'Pointer', 'Bora'],
            'Honda': ['Civic', 'Accord', 'City'],
            'Hyundai': ['Grand i10', 'Elantra', 'Accent', 'Sonata'],
            'Kia': ['Rio', 'Forte', 'K3', 'Optima'],
            'Mazda': ['Mazda 2', 'Mazda 3', 'Mazda 6'],
            'Dodge': ['Attitude', 'Charger', 'Neon', 'Dart'],
            'SEAT': ['Toledo'],
            'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'i4'],
            'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'Clase S', 'CLA', 'CLS'],
            'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
            'Peugeot': ['301', '508'],
            'Renault': ['Logan', 'Megane'],
            'MG': ['MG GT', 'MG5', 'MG4 EV', 'MG3'],
            'Subaru': ['Impreza', 'WRX', 'Legacy'],
            'Tesla': ['Model 3', 'Model S'],
            'BYD': ['Dolphin', 'Seal', 'Han', 'Seagull', 'King'],
            'Volvo': ['S60', 'S90', 'V60'],
            'Lexus': ['IS', 'ES', 'LS'],
            'Acura': ['ILX', 'TLX', 'Integra'],
            'Infiniti': ['Q50', 'Q60', 'G37'],
            'Lincoln': ['MKZ'],
            'Cadillac': ['CT4', 'CT5', 'CTS'],
            'Chrysler': ['300', '200'],
            'Alfa Romeo': ['Giulia', 'Giulietta', 'Mito'],
            'Fiat': ['Argo', 'Palio', 'Siena'],
            'Pontiac': ['G6', 'Grand Am', 'Matiz', 'Sunfire', 'Grand Prix']
        },
        'Hatchback': {
            'Volkswagen': ['Polo', 'Golf', 'Beetle', 'Golf GTI'],
            'SEAT': ['Ibiza', 'Leon'],
            'Chevrolet': ['Beat', 'Spark'],
            'Ford': ['Focus', 'Fiesta', 'Figo'],
            'Toyota': ['Yaris'],
            'Nissan': ['March', 'Note'],
            'Honda': ['Fit'],
            'Kia': ['Rio', 'Soul'],
            'Mazda': ['Mazda 2', 'Mazda 3'],
            'Peugeot': ['208', '308'],
            'Renault': ['Kwid', 'Clio'],
            'MINI': ['Cooper', 'Cooper S'],
            'Fiat': ['Mobi', 'Argo', '500', 'Uno']
        },
        'Camioneta': {
            'Ford': ['Explorer', 'Expedition', 'Edge', 'Escape', 'EcoSport', 'Bronco', 'Territory'],
            'Chevrolet': ['Trax', 'Captiva', 'Tracker', 'Suburban', 'Tahoe', 'Equinox', 'Blazer', 'Groove'],
            'Toyota': ['Avanza', 'Corolla Cross', 'RAV4', 'Highlander', 'Sienna', '4Runner', 'Sequoia', 'Land Cruiser', 'C-HR', 'Raize', 'Rush'],
            'Nissan': ['Kicks', 'X-Trail', 'Pathfinder', 'Armada', 'Juke', 'Murano'],
            'Volkswagen': ['Nivus', 'T-Cross', 'Taos', 'Tiguan', 'Teramont', 'Atlas', 'CrossFox', 'Touareg'],
            'Honda': ['CR-V', 'HR-V', 'Pilot', 'BR-V', 'Odyssey', 'WR-V'],
            'Hyundai': ['Creta', 'Tucson', 'Santa Fe', 'Kona', 'Palisade', 'Venue', 'Staria'],
            'Kia': ['Sportage', 'Sorento', 'Soul', 'Seltos', 'Sonet', 'Telluride', 'Carnival', 'Niro'],
            'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-90', 'CX-9', 'CX-7'],
            'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Commander', 'Wagoneer', 'Liberty', 'Patriot'],
            'Dodge': ['Durango', 'Journey', 'Grand Caravan'],
            'GMC': ['Yukon', 'Acadia', 'Terrain', 'Hummer EV'],
            'Subaru': ['Crosstrek', 'Forester', 'Outback', 'Ascent'],
            'BMW': ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX'],
            'Mercedes-Benz': ['GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Clase G'],
            'Audi': ['Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
            'Porsche': ['Macan', 'Cayenne'],
            'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Defender', 'Discovery', 'Discovery Sport', 'LR4'],
            'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator', 'MKX', 'MKC'],
            'Cadillac': ['XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq'],
            'Infiniti': ['QX50', 'QX55', 'QX60', 'QX80'],
            'Acura': ['RDX', 'MDX', 'ZDX'],
            'Lexus': ['NX', 'RX', 'GX', 'LX', 'UX'],
            'Buick': ['Encore', 'Envision', 'Enclave'],
            'Volvo': ['XC40', 'XC60', 'XC90', 'C40', 'EX30'],
            'Tesla': ['Model Y', 'Model X'],
            'BYD': ['Yuan Plus', 'Tang', 'Song Plus'],
            'Chirey': ['Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Omoda 5'],
            'Omoda': ['Omoda C5'],
            'Jetour': ['Dashing', 'X70', 'X70 Plus', 'X90 Plus'],
            'JAECOO': ['J7', 'J8'],
            'GWM': ['Haval H6', 'Haval Jolion', 'Ora 03', 'Tank 300'],
            'MG': ['ZS', 'HS', 'RX5', 'ONE'],
            'SEAT': ['Arona', 'Ateca', 'Tarraco'],
            'Cupra': ['Formentor', 'Ateca', 'Born', 'Tavascan'],
            'Peugeot': ['2008', '3008', '5008', 'Rifter'],
            'Renault': ['Stepway', 'Duster', 'Captur', 'Koleos']
        },
        'Van / Furgoneta': {
            'Mercedes-Benz': ['Sprinter'],
            'Ford': ['Transit'],
            'Chevrolet': ['Express'],
            'Ram': ['ProMaster', 'ProMaster Rapid'],
            'Peugeot': ['Manager', 'Expert', 'Partner'],
            'Renault': ['Master', 'Kangoo'],
            'Toyota': ['Hiace'],
            'Nissan': ['Urvan'],
            'Volkswagen': ['Transporter', 'Crafter'],
            'Foton': ['View CS2', 'Gratour', 'Toano'],
            'JAC': ['Sunray']
        },
        'Deportivo': {
            'Ford': ['Mustang'],
            'Chevrolet': ['Camaro', 'Corvette'],
            'Dodge': ['Challenger', 'Viper'],
            'Toyota': ['Supra', 'GR86'],
            'Nissan': ['370Z', 'GT-R', 'Z'],
            'Honda': ['Civic Type R'],
            'Mazda': ['MX-5 Miata'],
            'Porsche': ['718 Boxster', '718 Cayman', '911', 'Taycan', 'Panamera'],
            'BMW': ['M3', 'M4', 'M5', 'Serie 4', 'Z4'],
            'Audi': ['TT', 'R8'],
            'Mercedes-Benz': ['AMG GT', 'SL'],
            'Ferrari': ['488', 'F8 Tributo', 'Roma', 'SF90 Stradale', 'Portofino', '812 Superfast', '296 GTB', '458 Italia', 'California'],
            'Maserati': ['MC20', 'GranTurismo'],
            'McLaren': ['720S', '750S', 'Artura', 'GT', '570S', 'Senna', '650S'],
            'Aston Martin': ['Vantage', 'DB11', 'DBS', 'DB12', 'Rapide'],
            'Subaru': ['WRX', 'BRZ'],
            'Volkswagen': ['Golf GTI'],
            'Cupra': ['Leon'],
            'Tesla': ['Roadster']
        },
        'Camión': {
            'Kenworth': ['T680', 'T880', 'W900', 'K270', 'K370', 'T370', 'T470', 'T270', 'T380', 'T480', 'W990', 'T180', 'T280'],
            'Freightliner': ['Cascadia', 'M2 106', 'Columbia', 'FLD', 'Business Class M2', 'Coronado', '114SD', 'Century Class', 'Cascadia EV'],
            'International': ['ProStar', 'LT Series', 'LoneStar', 'MV Series', 'WorkStar', 'Durastar', 'TransStar', '4300', '9400', 'HX Series', 'RH Series'],
            'Isuzu': ['NPR', 'NQR', 'NRR', 'FTR', 'FVR', 'ELF 200', 'ELF 300', 'ELF 400', 'ELF 500', 'ELF 600', 'Forward'],
            'Hino': ['300 Series', '500 Series', '195', '268', '338', 'L6', 'L7', 'XL7', 'XL8'],
            'Peterbilt': ['389', '579', '567', '337', '348', '520', '379', '589', '536', '548', '220', '365', '367'],
            'Mack': ['Anthem', 'Pinnacle', 'Granite', 'LR', 'TerraPro', 'Super-Liner', 'MD Series'],
            'Scania': ['Serie R', 'Serie S', 'Serie G', 'Serie P', 'Serie L'],
            'Volvo': ['VNL', 'VNR', 'FH', 'FM'],
            'Mercedes-Benz': ['Actros', 'Atego', 'Axor'],
            'Foton': ['Auman', 'Aumark'],
            'JAC': ['X200']
        }
    },
    types: ['Sedán', 'Pickup', 'Camioneta', 'Van / Furgoneta', 'Hatchback', 'Deportivo', 'Motocicleta', 'Cuatrimoto / ATV', 'Barco', 'Camión'],
    colors: ['Blanco', 'Negro', 'Plata', 'Gris', 'Rojo', 'Azul', 'Guindo/Tinto', 'Beige', 'Amarillo', 'Verde', 'Otro'],
    states: [
        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México',
        'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán',
        'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
        'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
    ],
    citiesByState: {
        'Aguascalientes': ['Aguascalientes', 'Jesús María', 'Calvillo'],
        'Baja California': ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'],
        'Baja California Sur': ['La Paz', 'Los Cabos', 'Cabo San Lucas', 'San José del Cabo'],
        'Campeche': ['Campeche', 'Ciudad del Carmen', 'Champotón'],
        'Chiapas': ['Tuxtla Gutiérrez', 'Tapachula', 'San Cristóbal de las Casas'],
        'Chihuahua': ['Chihuahua', 'Ciudad Juárez', 'Hidalgo del Parral', 'Delicias', 'Cuauhtémoc'],
        'Ciudad de México': ['Ciudad de México'],
        'Coahuila': ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña'],
        'Colima': ['Colima', 'Manzanillo', 'Villa de Álvarez', 'Tecomán'],
        'Durango': ['Durango', 'Gómez Palacio', 'Lerdo'],
        'Estado de México': ['Toluca', 'Ecatepec', 'Naucalpan', 'Tlalnepantla', 'Nezahualcóyotl', 'Cuautitlán Izcalli'],
        'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Guanajuato', 'Salamanca', 'San Miguel de Allende'],
        'Guerrero': ['Acapulco', 'Chilpancingo', 'Iguala', 'Zihuatanejo'],
        'Hidalgo': ['Pachuca', 'Tulancingo', 'Tula', 'Ixmiquilpan'],
        'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Puerto Vallarta', 'Tonalá', 'Lagos de Moreno'],
        'Michoacán': ['Morelia', 'Uruapan', 'Zamora', 'Lázaro Cárdenas', 'Pátzcuaro'],
        'Morelos': ['Cuernavaca', 'Jiutepec', 'Cuautla', 'Temixco'],
        'Nayarit': ['Tepic', 'Bahía de Banderas', 'Compostela'],
        'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'Guadalupe', 'Apodaca', 'San Nicolás de los Garza', 'Santa Catarina'],
        'Oaxaca': ['Oaxaca de Juárez', 'Salina Cruz', 'San Juan Bautista Tuxtepec', 'Puerto Escondido'],
        'Puebla': ['Puebla', 'Cholula', 'Tehuacán', 'Atlixco', 'San Martín Texmelucan'],
        'Querétaro': ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués'],
        'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal', 'Tulum', 'Cozumel'],
        'San Luis Potosí': ['San Luis Potosí', 'Ciudad Valles', 'Soledad de Graciano Sánchez', 'Matehuala'],
        'Sinaloa': ['Culiacán', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato'],
        'Sonora': ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'Guaymas', 'Navojoa', 'San Luis Río Colorado'],
        'Tabasco': ['Villahermosa', 'Cárdenas', 'Comalcalco'],
        'Tamaulipas': ['Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Ciudad Victoria', 'Ciudad Madero'],
        'Tlaxcala': ['Tlaxcala', 'Apizaco', 'Huamantla'],
        'Veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Poza Rica', 'Boca del Río', 'Córdoba', 'Orizaba'],
        'Yucatán': ['Mérida', 'Valladolid', 'Tizimín', 'Progreso'],
        'Zacatecas': ['Zacatecas', 'Guadalupe', 'Fresnillo']
    }
};

// Sistema de Control de Versiones / Cache Invalidation
const currentLocalVersion = localStorage.getItem('revista_app_version');
if (currentLocalVersion !== APP_VERSION) {
    console.log(`Versión actualizada de ${currentLocalVersion} a ${APP_VERSION}. Purgando caché obsoleta...`);
    localStorage.removeItem('revista_autos_catalog');
    // Actualizamos la versión local
    localStorage.setItem('revista_app_version', APP_VERSION);
}

let catalogData = JSON.parse(localStorage.getItem('revista_autos_catalog')) || defaultCatalogData;
if (!catalogData.colors) catalogData.colors = defaultCatalogData.colors;

// Auto-fusionar marcas y modelos faltantes desde defaultCatalogData
if (!catalogData.makes) catalogData.makes = [...defaultCatalogData.makes];
if (!catalogData.modelsByMake) catalogData.modelsByMake = {};
defaultCatalogData.makes.forEach(make => {
    if (!catalogData.makes.includes(make)) {
        catalogData.makes.push(make);
    }
    if (!catalogData.modelsByMake[make] || catalogData.modelsByMake[make].length === 0) {
        catalogData.modelsByMake[make] = [...(defaultCatalogData.modelsByMake[make] || [])];
    }
});

// Sincronizar tipos y mapeo de modelos por tipo
if (!catalogData.types) {
    catalogData.types = [...defaultCatalogData.types];
} else {
    defaultCatalogData.types.forEach(t => {
        if (!catalogData.types.includes(t)) catalogData.types.push(t);
    });
}
catalogData.modelsByTypeAndMake = defaultCatalogData.modelsByTypeAndMake;
localStorage.setItem('revista_autos_catalog', JSON.stringify(catalogData));

const initialListings = [];

class Database {
    constructor() {
        this.listingsKey = 'revista_autos_listings';
        this.suggestionsKey = 'revista_autos_suggestions';
        this.apiBaseUrl = '/api';
        this.isServerConnected = false;
        this.uuidKey = 'revista_autos_uuid';
        const savedSettings = JSON.parse(localStorage.getItem('revista_settings') || '{}');
        this.adsEnabled = savedSettings.ads_enabled !== undefined ? savedSettings.ads_enabled : true; // Habilita los anuncios publicitarios en la app
        this.adFrequencyScroll = savedSettings.ad_frequency_scroll !== undefined ? Number(savedSettings.ad_frequency_scroll) : 10;
        this.initUUID();
        this.initializeDB();
        this.syncWithServer();
        this.syncAdsWithServer();
        this.initRealtime();
    }

    initUUID() {
        let uuid = localStorage.getItem(this.uuidKey);
        if (!uuid) {
            uuid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem(this.uuidKey, uuid);
        }
        this.uuid = uuid;
    }

    initRealtime() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                this.subscriptionListings = supabaseClient
                    .channel('public:listings')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, payload => {
                        console.log('⚡ Realtime update (listings):', payload);
                        this.syncWithServer().then(() => {
                            if (typeof window.onListingsSynced === 'function') window.onListingsSynced();
                        });
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('✅ Realtime conectado para la tabla listings');
                        }
                    });

                this.subscriptionAds = supabaseClient
                    .channel('public:ads')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, async payload => {
                        console.log('⚡ Realtime update (ads):', payload);
                        await this.syncAdsWithServer();
                        if (typeof window.onAdsSynced === 'function') {
                            window.onAdsSynced();
                        }
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('✅ Realtime conectado para la tabla ads');
                        }
                    });
            } catch (err) {
                console.error('Error al inicializar Supabase Realtime:', err);
            }
        }
    }

    initializeDB() {
        if (!localStorage.getItem(this.listingsKey)) {
            localStorage.setItem(this.listingsKey, JSON.stringify(initialListings));
        }
        if (!localStorage.getItem(this.suggestionsKey)) {
            localStorage.setItem(this.suggestionsKey, JSON.stringify([]));
        }
    }

    async syncWithServer() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {

                let query = supabaseClient.from('listings').select('*').order('created_at', { ascending: false });

                const isAdmin = localStorage.getItem('admin_token') !== null;

                if (!isAdmin) {
                    let queryStr = `publisher_id.eq.${this.uuid}`; // Mis anuncios
                    const savedIds = JSON.parse(localStorage.getItem('revista_autos_saved') || '[]');
                    if (savedIds.length > 0) {
                        queryStr += `,id.in.(${savedIds.join(',')})`;
                    }
                    query = query.or(queryStr);
                }

                const { data, error } = await query;

                if (!error && Array.isArray(data)) {
                    this.isServerConnected = true;

                    const localListings = JSON.parse(localStorage.getItem(this.listingsKey) || '[]');
                    const localListingsMap = new Map();
                    localListings.forEach(l => {
                        localListingsMap.set(String(l.id), l);
                    });

                    const serverIds = new Set(data.map(item => String(item.id)));

                    const normalized = data
                        .filter(item => item.status !== 'eliminado' && item.status !== 'rechazado')
                        .map(item => {
                            const localListing = localListingsMap.get(String(item.id));
                            const isMine = item.publisher_id === this.uuid || item.publisherId === this.uuid || (localListing && localListing.isMyListing);

                            // Preservar y fusionar notas CRM
                            let serverNotes = [];
                            if (item.notes) {
                                try { serverNotes = typeof item.notes === 'string' ? JSON.parse(item.notes) : item.notes; } catch (e) { serverNotes = []; }
                            }
                            let localNotes = localListing && Array.isArray(localListing.notes) ? localListing.notes : [];

                            const notesMap = new Map();
                            [...serverNotes, ...localNotes].forEach(n => {
                                if (n && n.text) {
                                    const key = n.id || `${n.timestamp}_${n.text}`;
                                    if (!notesMap.has(key)) notesMap.set(key, n);
                                }
                            });
                            const mergedNotes = Array.from(notesMap.values());

                            // Preservar y fusionar pagos
                            let serverPayments = [];
                            if (item.payments) {
                                try { serverPayments = typeof item.payments === 'string' ? JSON.parse(item.payments) : item.payments; } catch (e) { serverPayments = []; }
                            }
                            let localPayments = localListing && Array.isArray(localListing.payments) ? localListing.payments : [];

                            const paymentsMap = new Map();
                            [...serverPayments, ...localPayments].forEach(p => {
                                if (p && (p.amount !== undefined || p.id)) {
                                    const key = p.id || `${p.date}_${p.amount}`;
                                    if (!paymentsMap.has(key)) paymentsMap.set(key, p);
                                }
                            });
                            const mergedPayments = Array.from(paymentsMap.values());

                            // Si la publicación local tenía cambios pendientes de sincronización por estar offline, preservarlos
                            let mergedFields = { ...item };
                            if (localListing && localListing._pendingSync) {
                                mergedFields = {
                                    ...item,
                                    ...localListing
                                };
                                delete mergedFields._pendingSync;
                                delete localListing._pendingSync;
                                // Reintentar sincronizar a la nube de fondo
                                this.saveListing(localListing).catch(e => console.warn('Retry sync listing failed:', e));
                            }

                            return {
                                ...mergedFields,
                                engine: mergedFields.engine || item.engine || item.motor || (localListing ? localListing.engine : ''),
                                legal: mergedFields.legal || item.legal || item.situacion || (localListing ? localListing.legal : ''),
                                ac: mergedFields.ac || item.ac || (localListing ? localListing.ac : ''),
                                mileage: mergedFields.mileage !== undefined && mergedFields.mileage !== null ? String(mergedFields.mileage) : (localListing ? localListing.mileage : ''),
                                phone: mergedFields.seller_phone || mergedFields.phone || item.seller_phone || item.phone || (localListing ? localListing.phone : ''),
                                whatsapp: mergedFields.seller_whatsapp || mergedFields.whatsapp || item.seller_whatsapp || item.whatsapp || (localListing ? localListing.whatsapp : ''),
                                publishedAt: item.published_at || item.publishedAt || (localListing ? localListing.publishedAt : null),
                                expiresAt: item.expires_at || item.expiresAt || (localListing ? localListing.expiresAt : null),
                                lastRenewedMonth: item.last_renewed_month || item.lastRenewedMonth || (localListing ? localListing.lastRenewedMonth : null),
                                paymentStatus: item.payment_status || item.paymentStatus || (localListing ? localListing.paymentStatus : null),
                                images: mergedFields.images && mergedFields.images.length > 0 ? mergedFields.images : (localListing && localListing.images ? localListing.images : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80']),
                                notes: mergedNotes,
                                payments: mergedPayments,
                                reactions: item.reactions ? (typeof item.reactions === 'string' ? (function(){ try { return JSON.parse(item.reactions); } catch(e) { return item.reactions; } })() : item.reactions) : (localListing && localListing.reactions ? localListing.reactions : { like: 0, love: 0, fire: 0, angry: 0 }),
                                ref_number: item.ref_number || item.ref_number || (localListing ? localListing.ref_number : null),
                                old_price: item.old_price !== undefined && item.old_price !== null ? Number(item.old_price) : (localListing ? localListing.old_price : null),
                                publisherId: item.publisherId || item.publisher_id || (isMine ? this.uuid : ''),
                                publisher_id: item.publisher_id || item.publisherId || (isMine ? this.uuid : ''),
                                isMyListing: isMine
                            };
                        });

                    let finalListings = [];
                    if (isAdmin) {
                        finalListings = normalized;
                    } else {
                        const normalizedMap = new Map();
                        normalized.forEach(item => normalizedMap.set(String(item.id), item));

                        finalListings = localListings.map(item => {
                            if (normalizedMap.has(String(item.id))) {
                                const updated = normalizedMap.get(String(item.id));
                                normalizedMap.delete(String(item.id));
                                return updated;
                            }
                            return item;
                        });
                        normalizedMap.forEach(item => finalListings.push(item));
                    }

                    const newListingsStr = JSON.stringify(finalListings);
                    const oldListingsStr = localStorage.getItem(this.listingsKey);

                    if (newListingsStr !== oldListingsStr) {
                        localStorage.setItem(this.listingsKey, newListingsStr);
                        if (typeof window.onServerDataSynced === 'function') {
                            window.onServerDataSynced();
                        }
                    }
                } else {
                    console.error('Error fetching listings from Supabase:', error);
                }
            } catch (err) {
                console.error('Network or Supabase error during sync:', err);
                this.isServerConnected = false;
            }
        }
    }

    getAllListings() {
        const listings = JSON.parse(localStorage.getItem(this.listingsKey) || '[]');
        return listings.map(l => ({
            ...l,
            notes: Array.isArray(l.notes) ? l.notes : (typeof l.notes === 'string' ? JSON.parse(l.notes || '[]') : []),
            payments: Array.isArray(l.payments) ? l.payments : (typeof l.payments === 'string' ? JSON.parse(l.payments || '[]') : []),
            isMyListing: l.publisherId === this.uuid || l.publisher_id === this.uuid
        }));
    }

    async fetchFeedPaginated({ page = 1, pageSize = 20, state = null, cities = [], filters = {} } = {}) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            return { data: [], total: 0, hasMore: false };
        }

        const filtersHash = JSON.stringify({ state, cities, filters });

        // Inicializar el arreglo barajado de IDs si es la página 1, o si los filtros cambiaron
        if (page === 1 || this.currentFeedFiltersHash !== filtersHash || !this.shuffledFeedIds) {
            let query = supabaseClient.from('listings').select('id', { count: 'exact' }).eq('status', 'autorizado').limit(5000);

            if (cities && cities.length > 0) {
                query = query.in('city', cities);
            } else if (state && state !== 'Todos') {
                query = query.eq('state', state);
            }

            if (filters.category && filters.category !== 'Todos') {
                query = query.eq('type', filters.category);
            }
            if (filters.searchQuery) {
                query = query.or(`title.ilike.%${filters.searchQuery}%,make.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching ids for shuffle:', error);
                return { data: [], total: 0, hasMore: false };
            }

            // Guardar IDs y barajarlos aleatoriamente (sólo se manejan números, por lo que es ultra ligero)
            this.shuffledFeedIds = (data || []).map(d => d.id).sort(() => Math.random() - 0.5);
            this.currentFeedFiltersHash = filtersHash;
            this.shuffledFeedTotalCount = count || this.shuffledFeedIds.length;
        }

        const from = (page - 1) * pageSize;
        const to = page * pageSize; // exclusive para el slice
        const idsToFetch = this.shuffledFeedIds.slice(from, to);

        if (idsToFetch.length === 0) {
            return { data: [], total: this.shuffledFeedTotalCount, hasMore: false };
        }

        // Descargar exactamente los datos de los IDs barajados de esta página
        const { data, error } = await supabaseClient.from('listings').select('*').in('id', idsToFetch);

        if (error) {
            console.error('Error fetching paginated listings:', error);
            return { data: [], total: this.shuffledFeedTotalCount, hasMore: false };
        }

        // Supabase no garantiza el orden al usar .in(), así que reordenamos los resultados según nuestro arreglo barajado
        const idToIndex = {};
        idsToFetch.forEach((id, index) => idToIndex[id] = index);
        data.sort((a, b) => idToIndex[a.id] - idToIndex[b.id]);

        const normalizedData = (data || []).map(item => ({
            ...item,
            isMyListing: item.publisher_id === this.uuid || item.publisherId === this.uuid
        }));

        return {
            data: normalizedData,
            total: this.shuffledFeedTotalCount,
            hasMore: to < this.shuffledFeedIds.length
        };
    }

    async fetchCategoryStats(cities = []) {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            return [];
        }
        try {
            let query = supabaseClient
                .from('listings')
                .select('type, views')
                .eq('status', 'autorizado');

            if (cities && cities.length > 0) {
                query = query.in('city', cities);
            }

            const { data, error } = await query;
            if (error) {
                console.warn('Error fetching category stats:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('Network error fetching category stats:', e);
            return [];
        }
    }

    // --- ADS MANAGEMENT ---
    getAllAds() {
        const ads = JSON.parse(localStorage.getItem('revista_autos_ads') || '[]');
        return ads.map(a => ({
            ...a,
            notes: Array.isArray(a.notes) ? a.notes : (typeof a.notes === 'string' ? JSON.parse(a.notes || '[]') : []),
            social_links: Array.isArray(a.social_links) ? a.social_links : (typeof a.social_links === 'string' ? JSON.parse(a.social_links || '[]') : []),
            isMyAd: a.publisher_id === this.uuid
        }));
    }

    async saveAd(ad) {
        if (!ad.id) {
            ad.id = Date.now();
            ad.created_at = new Date().toISOString();
            ad.publisher_id = this.uuid;
            ad.views = 0;
            ad.clicks = 0;
            ad.is_active = ad.is_active !== undefined ? ad.is_active : false;
            ad.payment_status = ad.payment_status || 'pendiente';
            ad.images = ad.images || [];
            ad.social_links = ad.social_links || [];
        }

        if (!ad.ref_number) {
            const existingAds = this.getAllAds();
            const existingRefs = new Set(existingAds.map(a => a.ref_number).filter(r => r));
            let digits = 5;
            let maxAttempts = 50;
            let ref;
            while (true) {
                let min = Math.pow(10, digits - 1);
                let max = Math.pow(10, digits) - 1;
                let found = false;
                for (let i = 0; i < maxAttempts; i++) {
                    ref = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (!existingRefs.has(ref)) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
                digits++; // Expand number of digits if namespace is too crowded
            }
            ad.ref_number = ref;
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const payload = {
                id: ad.id,
                publisher_id: ad.publisher_id,
                title: ad.title,
                description: ad.description || '',
                address: ad.address || '',
                scheduleMF: ad.scheduleMF || '',
                scheduleSat: ad.scheduleSat || '',
                scheduleSun: ad.scheduleSun || '',
                phone: ad.phone || '',
                whatsapp: ad.whatsapp || '',
                email: ad.email || '',
                website: ad.website || '',
                social_links: ad.social_links || [],
                notes: ad.notes || [],
                city: ad.city || '',
                state: ad.state || '',
                images: ad.images || [],
                start_date: ad.start_date || null,
                end_date: ad.end_date || null,
                payment_status: ad.payment_status,
                is_active: ad.is_active,
                ref_number: ad.ref_number,
                views: ad.views || 0,
                clicks: ad.clicks || 0,
                created_at: ad.created_at
            };

            try {
                const { data, error } = await supabaseClient.from('ads').upsert([payload]);
                if (error) {
                    console.error('⚠️ Error al guardar el Ad en Supabase:', error);
                    ad._pendingSync = true;
                } else {
                    delete ad._pendingSync;
                }
            } catch (e) {
                console.error('⚠️ Excepción al guardar Ad en Supabase:', e);
                ad._pendingSync = true;
            }
        }

        const ads = this.getAllAds();
        const index = ads.findIndex(a => String(a.id) === String(ad.id));
        if (index > -1) {
            ads[index] = { ...ads[index], ...ad };
        } else {
            ads.push(ad);
        }
        localStorage.setItem('revista_autos_ads', JSON.stringify(ads));

        return ad;
    }

    async deleteAd(id) {
        // Eliminar del estado local INMEDIATAMENTE para reflejar el cambio en UI
        const currentAds = this.getAllAds();
        const updatedAds = currentAds.filter(a => String(a.id) !== String(id));
        localStorage.setItem('revista_autos_ads', JSON.stringify(updatedAds));

        // Continuar con la eliminación en la base de datos
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const adToDelete = currentAds.find(a => String(a.id) === String(id));

            if (adToDelete && adToDelete.images && adToDelete.images.length > 0) {
                const pathsToDelete = [];
                adToDelete.images.forEach(imgUrl => {
                    if (imgUrl.includes('/car-images/')) {
                        const pathParts = imgUrl.split('/car-images/');
                        if (pathParts.length > 1) {
                            pathsToDelete.push(pathParts[1]);
                        }
                    }
                });

                if (pathsToDelete.length > 0) {
                    supabaseClient.storage.from('car-images').remove(pathsToDelete).then(({ error }) => {
                        if (error) console.error('⚠️ Error al eliminar fotos del Ad en Storage:', error);
                    });
                }
            }

            const { error } = await supabaseClient.from('ads').delete().eq('id', id);
            if (error) console.error('⚠️ Error al eliminar Ad en Supabase:', error);
        }
    }

    async uploadImageToSupabase(file) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
                const fileName = `auto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
                const filePath = `cars/${fileName}`;

                const { data, error } = await supabaseClient.storage
                    .from('car-images')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (error) throw error;

                const { data: publicUrlData } = supabaseClient.storage
                    .from('car-images')
                    .getPublicUrl(filePath);

                return publicUrlData.publicUrl;
            } catch (err) {
                console.error('Error al subir imagen a Supabase Storage:', err);
                return null;
            }
        }
        return null;
    }

    async saveListing(listing) {
        // Configurar los campos del anuncio
        if (!listing.id) {
            listing.id = Date.now();
            listing.publishedAt = new Date().toISOString();
            listing.status = listing.status || 'pendiente autorizacion';
            listing.publisherId = this.uuid;
            listing.publisher_id = this.uuid;
            listing.isMyListing = true;
            listing.views = 0;
            if (!listing.images || listing.images.length === 0) {
                listing.images = ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'];
            }
        } else {
            listing.publisherId = listing.publisherId || listing.publisher_id || this.uuid;
            listing.publisher_id = listing.publisherId;
            listing.isMyListing = listing.isMyListing !== undefined ? listing.isMyListing : true;
        }

        if (!listing.ref_number) {
            const existingListings = this.getAllListings();
            const existingRefs = new Set(existingListings.map(l => l.ref_number).filter(r => r));
            let digits = 5;
            let maxAttempts = 50;
            let ref;
            while (true) {
                let min = Math.pow(10, digits - 1);
                let max = Math.pow(10, digits) - 1;
                let found = false;
                for (let i = 0; i < maxAttempts; i++) {
                    ref = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (!existingRefs.has(ref)) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
                digits++;
            }
            listing.ref_number = ref;
        }

        // Sincronizar PRIMERO con Supabase Cloud
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const payload = {
                id: listing.id,
                title: listing.title,
                type: listing.type,
                make: listing.make,
                model: listing.model,
                year: Number(listing.year),
                price: Number(listing.price),
                state: listing.state || '',
                city: listing.city,
                color: listing.color || '',
                engine: listing.engine || '',
                transmission: listing.transmission || 'Automática',
                mileage: listing.mileage !== undefined && listing.mileage !== null ? String(listing.mileage) : '',
                legal: listing.legal || '',
                ac: listing.ac || '',
                trim: listing.trim || '',
                description: listing.description || '',
                seller_name: listing.seller_name || listing.phone || '',
                seller_phone: listing.phone || '',
                seller_whatsapp: listing.whatsapp || '',
                images: listing.images || [],
                status: listing.status || 'pendiente autorizacion',
                views: listing.views || 0,
                reactions: listing.reactions || { like: 0, love: 0, fire: 0, angry: 0 },
                notes: listing.notes || [],
                payments: listing.payments || [],
                publisher_id: listing.publisherId || listing.publisher_id || '',
                published_at: listing.publishedAt || listing.published_at || null,
                expires_at: listing.expiresAt || listing.expires_at || null,
                last_renewed_month: listing.lastRenewedMonth || listing.last_renewed_month || null,
                payment_status: listing.paymentStatus || listing.payment_status || null,
                sold_at: listing.soldAt || listing.sold_at || null,
                ref_number: listing.ref_number,
                old_price: listing.old_price !== undefined ? listing.old_price : null
            };

            try {
                const { data, error } = await supabaseClient.from('listings').upsert([payload]);
                if (error) {
                    console.error('⚠️ Error al guardar en Supabase:', error);
                    listing._pendingSync = true;
                } else {
                    delete listing._pendingSync;
                    console.log('✅ Anuncio sincronizado exitosamente con Supabase Cloud');
                }
            } catch (e) {
                console.error('⚠️ Excepción al guardar en Supabase:', e);
                listing._pendingSync = true;
            }
        } else {
            const response = await fetch(`${this.apiBaseUrl}/listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listing)
            });
            if (!response.ok) {
                throw new Error("Error al enviar publicación al servidor");
            }
        }

        // Si llegamos aquí, la subida a la nube fue un ÉXITO.
        // Solo entonces lo guardamos en la memoria local (localStorage).
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(listing.id));
        if (index > -1) {
            listings[index] = { ...listings[index], ...listing };
        } else {
            listings.push(listing);
        }
        localStorage.setItem(this.listingsKey, JSON.stringify(listings));

        return listing;
    }

    async deleteListing(id) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const listings = this.getAllListings();
            const listingToDelete = listings.find(l => String(l.id) === String(id));

            // 1. Eliminar permanentemente las fotos del servidor (Supabase Storage)
            if (listingToDelete && listingToDelete.images && listingToDelete.images.length > 0) {
                const pathsToDelete = [];
                listingToDelete.images.forEach(imgUrl => {
                    // Extraer la ruta del archivo si está alojado en Supabase
                    if (imgUrl.includes('/car-images/')) {
                        const pathParts = imgUrl.split('/car-images/');
                        if (pathParts.length > 1) {
                            pathsToDelete.push(pathParts[1]); // Ejemplo: 'cars/auto_123.jpg'
                        }
                    }
                });

                if (pathsToDelete.length > 0) {
                    supabaseClient.storage.from('car-images').remove(pathsToDelete).then(({ error }) => {
                        if (error) console.error('⚠️ Error al eliminar fotos en Storage:', error);
                        else console.log(`✅ ${pathsToDelete.length} fotos eliminadas permanentemente del servidor.`);
                    });
                }
            }

            // 2. Eliminar permanentemente el registro de la base de datos
            const { error } = await supabaseClient.from('listings').delete().eq('id', id);

            if (error) {
                console.error('⚠️ Error al eliminar en Supabase, aplicando soft-delete:', error);
                if (listingToDelete) {
                    listingToDelete.status = 'eliminado';
                    await this.saveListing(listingToDelete);
                }
            } else {
                console.log('✅ Anuncio eliminado permanentemente de la base de datos');
            }
        }

        // 3. Eliminar localmente SIEMPRE para que desaparezca de la UI de quien lo borra
        const currentListings = this.getAllListings();
        const updatedListings = currentListings.filter(l => String(l.id) !== String(id));
        localStorage.setItem(this.listingsKey, JSON.stringify(updatedListings));
    }

    getMyListings() {
        return this.getAllListings().filter(l => l.isMyListing);
    }

    isListingActive(listing) {
        if (listing.status !== 'autorizado') return false;

        // Rolling billing: priorizar expiresAt si existe
        if (listing.expiresAt) {
            return new Date(listing.expiresAt) > new Date();
        }

        // Fallback para publicaciones antiguas con lastRenewedMonth
        if (listing.lastRenewedMonth) {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            return listing.lastRenewedMonth >= currentMonthStr;
        }

        // Sin fecha de vencimiento = publicación de prueba/demo, siempre activa
        return true;
    }

    // ── Popularidad inteligente por ciudad (GPS) ──
    async fetchPopularityStats(city) {
        if (!city || typeof supabaseClient === 'undefined' || !supabaseClient) {
            window._popularityStats = null;
            return;
        }
        try {
            const { data, error } = await supabaseClient
                .from('listings')
                .select('type, make, model, color')
                .eq('status', 'autorizado')
                .eq('city', city);

            if (error || !data || data.length === 0) {
                // Sin datos para esta ciudad, intentar con todas las ciudades
                const { data: allData, error: allError } = await supabaseClient
                    .from('listings')
                    .select('type, make, model, color')
                    .eq('status', 'autorizado');

                if (allError || !allData || allData.length === 0) {
                    window._popularityStats = null;
                    return;
                }
                data.length = 0; // limpiar
                allData.forEach(d => data.push(d));
            }

            // Contar ocurrencias por campo
            const counts = { types: {}, makes: {}, models: {}, colors: {} };
            data.forEach(item => {
                if (item.type) counts.types[item.type] = (counts.types[item.type] || 0) + 1;
                if (item.make) counts.makes[item.make] = (counts.makes[item.make] || 0) + 1;
                if (item.model) counts.models[item.model] = (counts.models[item.model] || 0) + 1;
                if (item.color) counts.colors[item.color] = (counts.colors[item.color] || 0) + 1;
            });

            window._popularityStats = counts;
            console.log('📊 Popularidad cargada para ciudad:', city, counts);
        } catch (e) {
            console.warn('⚠️ Error cargando stats de popularidad:', e);
            window._popularityStats = null;
        }
    }

    sortByPopularity(list, field) {
        if (!window._popularityStats || !window._popularityStats[field]) return list;
        const counts = window._popularityStats[field];
        const withCount = list.filter(item => counts[item] && counts[item] > 0);
        const withoutCount = list.filter(item => !counts[item] || counts[item] === 0);
        withCount.sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
        withoutCount.sort((a, b) => a.localeCompare(b, 'es'));
        return [...withCount, ...withoutCount];
    }

    getMakesForType(type) {
        if (!type || type === 'Otros' || type === 'Todas') {
            const makes = (catalogData && catalogData.makes) ? [...catalogData.makes] : [...defaultCatalogData.makes];
            return this.sortByPopularity(makes, 'makes');
        }

        const typeMap = (catalogData && catalogData.modelsByTypeAndMake)
            ? catalogData.modelsByTypeAndMake[type]
            : (defaultCatalogData.modelsByTypeAndMake ? defaultCatalogData.modelsByTypeAndMake[type] : null);

        if (typeMap) {
            const availableMakes = Object.keys(typeMap).filter(make => typeMap[make] && typeMap[make].length > 0);
            if (availableMakes.length > 0) {
                return this.sortByPopularity(availableMakes, 'makes');
            }
        }

        const motoOnlyMakes = ['Italika', 'Vento', 'Bajaj', 'Harley-Davidson', 'KTM', 'Polaris', 'Can-Am', 'CFMoto', 'Veloci', 'Hero', 'TVS', 'Indian Motorcycle', 'Aprilia', 'Kymco', 'Royal Enfield', 'Triumph', 'Ducati'];
        const marineMakes = ['Sea-Doo', 'Yamaha', 'Honda', 'Suzuki', 'Kawasaki'];
        const truckMakes = ['Kenworth', 'Freightliner', 'International', 'Peterbilt', 'Hino', 'Isuzu', 'Mack', 'Scania', 'Volvo', 'Foton', 'JAC', 'Ram', 'Chevrolet', 'Ford', 'GMC', 'Mercedes-Benz', 'Volkswagen'];

        const allMakes = (catalogData && catalogData.makes) ? [...catalogData.makes] : [...defaultCatalogData.makes];

        let filtered;
        if (type === 'Motocicleta' || type === 'Cuatrimoto / ATV') {
            filtered = allMakes.filter(m => motoOnlyMakes.includes(m) || ['Honda', 'Yamaha', 'Suzuki', 'BMW', 'Sea-Doo', 'Kawasaki'].includes(m));
        } else if (type === 'Barco') {
            filtered = allMakes.filter(m => marineMakes.includes(m));
        } else if (type === 'Camión') {
            filtered = allMakes.filter(m => truckMakes.includes(m));
        } else if (['Sedán', 'Pickup', 'Camioneta', 'Hatchback', 'Deportivo'].includes(type)) {
            filtered = allMakes.filter(m => !motoOnlyMakes.includes(m));
        } else {
            filtered = allMakes;
        }

        return this.sortByPopularity(filtered, 'makes');
    }

    getModelsForTypeAndMake(type, make) {
        if (!make) return [];
        const allModels = (catalogData && catalogData.modelsByMake && catalogData.modelsByMake[make])
            ? [...catalogData.modelsByMake[make]]
            : [...(defaultCatalogData.modelsByMake[make] || [])];

        if (!type || type === 'Otros' || type === 'Todas') {
            return this.sortByPopularity(allModels, 'models');
        }

        const typeMap = (catalogData && catalogData.modelsByTypeAndMake)
            ? catalogData.modelsByTypeAndMake[type]
            : (defaultCatalogData.modelsByTypeAndMake ? defaultCatalogData.modelsByTypeAndMake[type] : null);

        if (typeMap && typeMap[make] && Array.isArray(typeMap[make]) && typeMap[make].length > 0) {
            return this.sortByPopularity([...typeMap[make]], 'models');
        }

        return this.sortByPopularity(allModels, 'models');
    }

    getRandomListings(count, city = null) {
        let activeListings = this.getAllListings().filter(l => this.isListingActive(l));
        if (city) {
            const cityListings = activeListings.filter(l => l.city === city);
            if (cityListings.length >= count / 2) {
                activeListings = cityListings;
            }
        }
        const shuffled = activeListings.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    async search(criteria) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            let query = supabaseClient.from('listings').select('*').eq('status', 'autorizado');

            if (criteria.query) {
                const q = criteria.query.toLowerCase();
                query = query.or(`title.ilike.%${q}%,make.ilike.%${q}%,model.ilike.%${q}%,type.ilike.%${q}%`);
            }
            if (criteria.cities && criteria.cities.length > 0) {
                query = query.in('city', criteria.cities);
            }
            if (criteria.year) {
                query = query.eq('year', criteria.year);
            }
            if (criteria.minYear) {
                query = query.gte('year', criteria.minYear);
            }
            if (criteria.maxYear) {
                query = query.lte('year', criteria.maxYear);
            }
            if (criteria.transmission && criteria.transmission !== 'Todas') {
                query = query.eq('transmission', criteria.transmission);
            }
            if (criteria.legal && criteria.legal !== 'Todas') {
                query = query.eq('legal', criteria.legal);
            }
            if (criteria.color && criteria.color !== 'Todos') {
                query = query.eq('color', criteria.color);
            }

            // Limit search results to avoid massive payloads
            query = query.limit(50);

            const { data, error } = await query;
            if (!error && data) {
                return data;
            }
        }

        // Fallback offline (sólo buscará en favoritos y mis anuncios)
        let results = this.getAllListings().filter(l => this.isListingActive(l));

        if (criteria.query) {
            const q = criteria.query.toLowerCase();
            results = results.filter(l =>
                (l.title && l.title.toLowerCase().includes(q)) ||
                (l.make && l.make.toLowerCase().includes(q)) ||
                (l.model && l.model.toLowerCase().includes(q)) ||
                (l.type && l.type.toLowerCase().includes(q))
            );
        }

        if (criteria.cities && criteria.cities.length > 0) {
            results = results.filter(l => criteria.cities.includes(l.city));
        }
        if (criteria.year) {
            results = results.filter(l => Number(l.year) === Number(criteria.year));
        }
        if (criteria.minYear) {
            results = results.filter(l => Number(l.year) >= criteria.minYear);
        }
        if (criteria.maxYear) {
            results = results.filter(l => Number(l.year) <= criteria.maxYear);
        }
        if (criteria.transmission && criteria.transmission !== 'Todas') {
            results = results.filter(l => l.transmission === criteria.transmission);
        }
        if (criteria.legal && criteria.legal !== 'Todas') {
            results = results.filter(l => l.legal === criteria.legal);
        }

        if (criteria.color && criteria.color !== 'Todos') {
            results = results.filter(l => l.color === criteria.color);
        }
        return results;
    }

    markAsSold(id) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            listings[index].status = 'vendido';
            listings[index].soldAt = new Date().toISOString();
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
            this.recordSaleHistory(listings[index]);
        }
    }

    renewListing(id) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            const currentExp = listings[index].expiresAt ? new Date(listings[index].expiresAt) : new Date();
            const baseDate = currentExp > new Date() ? currentExp : new Date();
            baseDate.setDate(baseDate.getDate() + 30);
            listings[index].expiresAt = baseDate.toISOString();
            listings[index].status = 'autorizado';
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
        }
    }

    updateListing(id, updatedData) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            listings[index] = { ...listings[index], ...updatedData };
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]);
        }
    }

    getPendingCount() {
        return this.getAllListings().filter(l => l.status === 'pendiente autorizacion' || l.status === 'pendiente').length;
    }

    getPendingRenewals() {
        return this.getAllListings().filter(l => l.status === 'autorizado' && !this.isListingActive(l));
    }

    // --- Sugerencias de Catálogo ---
    getSuggestions() {
        return JSON.parse(localStorage.getItem(this.suggestionsKey) || '[]');
    }

    addSuggestion(type, value, parentMake = null) {
        if (!value || value.trim() === '') return;
        const suggestions = this.getSuggestions();
        const valueTrim = value.trim();

        let existing = suggestions.find(s => s.type === type && s.value.toLowerCase() === valueTrim.toLowerCase() && s.parentMake === parentMake);
        if (existing) {
            existing.count += 1;
        } else {
            existing = {
                id: Date.now() + Math.random(),
                type: type,
                value: valueTrim,
                parentMake: parentMake,
                count: 1,
                status: 'pending'
            };
            suggestions.push(existing);
        }

        if (existing.count >= 2 && existing.status !== 'approved') {
            existing.status = 'approved';

            if (existing.type === 'make') {
                if (!catalogData.makes.includes(existing.value)) {
                    catalogData.makes.push(existing.value);
                    catalogData.modelsByMake[existing.value] = [];
                }
            } else if (existing.type === 'model' && existing.parentMake) {
                if (!catalogData.modelsByMake[existing.parentMake]) {
                    catalogData.modelsByMake[existing.parentMake] = [];
                }
                if (!catalogData.modelsByMake[existing.parentMake].includes(existing.value)) {
                    catalogData.modelsByMake[existing.parentMake].push(existing.value);
                }
            } else if (existing.type === 'type') {
                if (!catalogData.types.includes(existing.value)) {
                    catalogData.types.push(existing.value);
                }
            }
            localStorage.setItem('revista_autos_catalog', JSON.stringify(catalogData));
        }

        localStorage.setItem(this.suggestionsKey, JSON.stringify(suggestions));
    }

    addListingNote(id, noteText, skipSave = false) {
        if (!noteText || !noteText.trim()) return null;
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1) {
            if (!listings[index].notes) {
                listings[index].notes = [];
            }
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

            const newNote = {
                id: Date.now(),
                timestamp: `${dateStr}, ${timeStr}`,
                text: noteText.trim()
            };
            listings[index].notes.unshift(newNote);
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            if (!skipSave) this.saveListing(listings[index]);
            return newNote;
        }
        return null;
    }

    addPayment(listingId, amount, receiptImage, type = 'Aprobación', method = 'manual', skipSave = false) {
        // --- Compatibilidad con el sistema anterior: guardar dentro del listing ---
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(listingId));
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

        const newPayment = {
            id: Date.now(),
            date: `${dateStr}, ${timeStr}`,
            dateISO: now.toISOString(),
            amount: amount,
            receiptImage: receiptImage || null,
            type: type,
            method: method, // 'mercadopago' | 'manual'
            listingId: String(listingId),
            listingTitle: index !== -1 ? listings[index].title : `ID ${listingId}`,
            listingCity: index !== -1 ? (listings[index].city || '') : ''
        };

        // Guardar dentro del listing (legacy)
        if (index !== -1) {
            if (!listings[index].payments) listings[index].payments = [];
            listings[index].payments.push(newPayment);
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            if (!skipSave) this.saveListing(listings[index]);
            this.addListingNote(listingId, `Pago registrado: $${amount} MXN (${type}) [${method === 'mercadopago' ? 'Tarjeta MP' : 'Manual'}]`, skipSave);
        }

        // --- STORAGE INDEPENDIENTE: los pagos sobreviven al borrar publicaciones ---
        const logKey = 'revista_payments_log';
        const log = JSON.parse(localStorage.getItem(logKey) || '[]');
        log.unshift(newPayment);
        localStorage.setItem(logKey, JSON.stringify(log));

        return newPayment;
    }

    addAdPayment(adId, amount, receiptImage, type = 'Publicidad', method = 'manual', skipSave = false) {
        const ads = this.getAllAds();
        const index = ads.findIndex(a => String(a.id) === String(adId));
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

        const adTitle = index !== -1 ? (ads[index].title || `Publicidad #${adId}`) : `Publicidad #${adId}`;
        const adCity = index !== -1 ? (ads[index].city || ads[index].target_city || ads[index].state || 'Global') : 'Global';

        const newPayment = {
            id: Date.now(),
            date: `${dateStr}, ${timeStr}`,
            dateISO: now.toISOString(),
            amount: Number(amount) || 0,
            receiptImage: receiptImage || null,
            type: type,
            method: method, // 'mercadopago' | 'manual'
            listingId: `AD-${adId}`,
            listingTitle: `[Publicidad] ${adTitle}`,
            listingCity: adCity
        };

        if (index !== -1) {
            if (!ads[index].payments) ads[index].payments = [];
            ads[index].payments.push(newPayment);
            localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
            if (!skipSave) this.saveAd(ads[index]);
            this.addAdNote(adId, `Pago registrado: $${amount} MXN (${type}) [${method === 'mercadopago' ? 'Tarjeta MP' : 'Manual'}]`);
        }

        const logKey = 'revista_payments_log';
        const log = JSON.parse(localStorage.getItem(logKey) || '[]');
        log.unshift(newPayment);
        localStorage.setItem(logKey, JSON.stringify(log));

        return newPayment;
    }

    getAllPayments() {
        // Priorizar el log independiente (sobrevive a borrado de listings)
        const logKey = 'revista_payments_log';
        const rawLog = localStorage.getItem(logKey);

        // Si la clave YA EXISTE (aunque sea array vacío), respetamos ese estado.
        // Solo hacemos fallback si nunca se inicializó (clave null = sistema antiguo).
        if (rawLog !== null) {
            const log = JSON.parse(rawLog);
            return log.sort((a, b) => (b.id || 0) - (a.id || 0));
        }

        // Fallback ÚNICO: migración desde el sistema anterior (listings con payments embebidos)
        // Solo entra aquí si la clave nunca existió en localStorage
        const listings = this.getAllListings();
        let allPayments = [];
        listings.forEach(l => {
            if (l.payments && l.payments.length > 0) {
                l.payments.forEach(p => {
                    allPayments.push({
                        ...p,
                        listingId: l.id,
                        listingTitle: l.title,
                        listingCity: l.city || '',
                        timestamp: p.id
                    });
                });
            }
        });
        // Migrar al nuevo log (una sola vez) e inicializar la clave
        const migratedLog = allPayments.sort((a, b) => (b.id || b.timestamp || 0) - (a.id || a.timestamp || 0));
        localStorage.setItem(logKey, JSON.stringify(migratedLog));
        return migratedLog;
    }

    deletePayment(paymentId) {
        const logKey = 'revista_payments_log';
        const log = JSON.parse(localStorage.getItem(logKey) || '[]');
        const filtered = log.filter(p => String(p.id) !== String(paymentId));
        localStorage.setItem(logKey, JSON.stringify(filtered));
        return filtered;
    }

    deletePayments(paymentIds) {
        const logKey = 'revista_payments_log';
        const log = JSON.parse(localStorage.getItem(logKey) || '[]');
        const idSet = new Set(paymentIds.map(String));
        const filtered = log.filter(p => !idSet.has(String(p.id)));
        localStorage.setItem(logKey, JSON.stringify(filtered));
        return filtered;
    }

    // --- Nuevos métodos para Supabase (Settings, Auth, Locations) ---
    async getSettings() {
        const defaultSettings = { monthlyPrice: 500, adMonthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '', ads_enabled: true, ad_frequency_scroll: 10, ad_fallback_limit: 21 };
        const local = localStorage.getItem('revista_settings');
        const parsedLocal = local ? JSON.parse(local) : defaultSettings;

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
            if (data) {
                const fallbackVal = parsedLocal.ad_fallback_limit !== undefined ? Number(parsedLocal.ad_fallback_limit) : 21;
                const s = {
                    monthlyPrice: data.monthlyprice !== undefined ? data.monthlyprice : (data.monthlyPrice || 500),
                    adMonthlyPrice: data.admonthlyprice !== undefined ? data.admonthlyprice : (data.adMonthlyPrice || 500),
                    mercadoPagoEnabled: data.mercadopagoenabled !== undefined ? data.mercadopagoenabled : (data.mercadoPagoEnabled || false),
                    mpPublicKey: data.mppublickey !== undefined ? data.mppublickey : (data.mpPublicKey || ''),
                    mpAccessToken: data.mpaccesstoken !== undefined ? data.mpaccesstoken : (data.mpAccessToken || ''),
                    ads_enabled: data.ads_enabled !== undefined ? data.ads_enabled : true,
                    ad_frequency_scroll: data.ad_frequency_scroll !== undefined ? Number(data.ad_frequency_scroll) : 10,
                    ad_fallback_limit: data.ad_fallback_limit !== undefined ? Number(data.ad_fallback_limit) : (data.adfallbacklimit !== undefined ? Number(data.adfallbacklimit) : fallbackVal)
                };
                this.adsEnabled = s.ads_enabled;
                this.adFrequencyScroll = s.ad_frequency_scroll;
                this.adFallbackLimit = s.ad_fallback_limit;
                return { success: true, settings: s };
            }
            if (error) console.error('Error fetching settings:', error);
        }
        this.adsEnabled = parsedLocal.ads_enabled !== undefined ? parsedLocal.ads_enabled : true;
        this.adFrequencyScroll = parsedLocal.ad_frequency_scroll !== undefined ? Number(parsedLocal.ad_frequency_scroll) : 10;
        this.adFallbackLimit = parsedLocal.ad_fallback_limit !== undefined ? Number(parsedLocal.ad_fallback_limit) : 21;
        return { success: true, settings: parsedLocal };
    }

    async saveSettings(settings) {
        localStorage.setItem('revista_settings', JSON.stringify(settings));
        if (settings.ads_enabled !== undefined) this.adsEnabled = settings.ads_enabled;
        if (settings.ad_frequency_scroll !== undefined) this.adFrequencyScroll = Number(settings.ad_frequency_scroll);
        if (settings.ad_fallback_limit !== undefined) this.adFallbackLimit = Number(settings.ad_fallback_limit);
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                // Postgres guarda columnas sin comillas en minúsculas. Mapeamos de camelCase a minúsculas
                const payload = {
                    id: 1,
                    monthlyprice: settings.monthlyPrice,
                    admonthlyprice: settings.adMonthlyPrice,
                    mercadopagoenabled: settings.mercadoPagoEnabled,
                    mppublickey: settings.mpPublicKey,
                    mpaccesstoken: settings.mpAccessToken,
                    ads_enabled: settings.ads_enabled,
                    ad_frequency_scroll: settings.ad_frequency_scroll,
                    ad_fallback_limit: settings.ad_fallback_limit
                };
                let { error } = await supabaseClient.from('settings').upsert([payload]);
                if (error) {
                    console.warn('Advertencia al guardar settings en Supabase (posible columna faltante):', error.message);
                    delete payload.ad_fallback_limit;
                    const res = await supabaseClient.from('settings').upsert([payload]);
                    if (res.error) {
                        console.warn('Reintento de settings en Supabase:', res.error.message);
                    }
                }
            } catch (err) {
                // Si el proyecto de Supabase está pausado o eliminado, lanza error de red
                return { success: false, error: "No se pudo conectar a la base de datos (Supabase puede estar pausado o inactivo). Error: " + err.message };
            }
        }
        return { success: true };
    }

    async getActiveLocations() {
        let activeListings = [];
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                // Consultar estados y ciudades directamente de los autos autorizados
                const { data, error } = await supabaseClient
                    .from('listings')
                    .select('state, city, expires_at, status')
                    .eq('status', 'autorizado');

                if (!error && data) {
                    activeListings = data.filter(l => {
                        if (l.expires_at) {
                            return new Date(l.expires_at) > new Date();
                        }
                        return true;
                    });
                } else {
                    activeListings = this.getAllListings().filter(l => this.isListingActive(l));
                }
            } catch (e) {
                activeListings = this.getAllListings().filter(l => this.isListingActive(l));
            }
        } else {
            activeListings = this.getAllListings().filter(l => this.isListingActive(l));
        }

        const locationsMap = {};

        activeListings.forEach(l => {
            let state = l.state;
            const city = l.city;

            // Si no hay estado pero sí ciudad, intentar deducirlo del catálogo
            if (!state && city && typeof catalogData !== 'undefined') {
                for (const s of catalogData.states) {
                    if (catalogData.citiesByState[s] && catalogData.citiesByState[s].includes(city)) {
                        state = s;
                        break;
                    }
                }
            }

            if (state) {
                if (!locationsMap[state]) locationsMap[state] = [];
                if (city && !locationsMap[state].includes(city)) {
                    locationsMap[state].push(city);
                }
            }
        });

        if (Object.keys(locationsMap).length > 0) {
            return { success: true, locations: locationsMap };
        }

        // No active vehicles found — return empty so callers use their own fallback
        return { success: true, locations: {} };
    }

    async loginAdmin(username, password) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                // SECURITY: Se usa una función RPC segura (verify_admin_user) en lugar de
                // consultar la tabla admin_users directamente. Esto evita que cualquier
                // usuario con la anon key pueda enumerar o leer la tabla de administradores.
                const { data, error } = await supabaseClient
                    .rpc('verify_admin_user', { p_username: username, p_password: password });

                if (error) {
                    console.error("Error verificando credenciales de admin:", error.message);
                }

                if (data && data.length > 0) {
                    const user = data[0];
                    return {
                        success: true,
                        token: 'admin-token-' + user.id,
                        role: user.role,
                        user: { id: user.id, username: user.username, role: user.role, allowedStates: user.allowed_states, allowedCities: user.allowed_cities }
                    };
                }
            } catch (err) {
                console.warn("Error de red al verificar credenciales de admin:", err);
            }
        }

        return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    async getAdminUsers() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient.from('admin_users').select('*');
                if (data) {
                    const mappedUsers = data.map(u => ({
                        ...u,
                        allowedStates: u.allowedstates,
                        allowedCities: u.allowedcities
                    }));
                    return { success: true, users: mappedUsers };
                }
            } catch (err) {
                console.warn("Error consultando getAdminUsers en Supabase:", err);
            }
        }
        return { success: true, users: [] };
    }

    async saveAdminUser(user) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const dbUser = {
                    ...user,
                    allowedstates: user.allowedStates || [],
                    allowedcities: user.allowedCities || []
                };
                delete dbUser.allowedStates;
                delete dbUser.allowedCities;

                if (dbUser.id) {
                    dbUser.id = Number(dbUser.id);
                } else {
                    delete dbUser.id;
                }

                const { error } = await supabaseClient.from('admin_users').upsert([dbUser], { onConflict: 'username' });
                if (error) {
                    console.warn("Error guardando adminUser en Supabase:", error.message);
                    return { success: false, error: error.message };
                }
            } catch (err) {
                console.warn("Error de red guardando adminUser en Supabase:", err);
                return { success: false, error: err.message || 'Error de conexión' };
            }
        }
        return { success: true };
    }

    async deleteAdminUser(id) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { error } = await supabaseClient.from('admin_users').delete().eq('id', Number(id));
                if (error) {
                    console.warn("Error eliminando adminUser en Supabase:", error.message);
                    return { success: false, error: error.message };
                }
            } catch (err) {
                console.warn("Error de red eliminando adminUser en Supabase:", err);
                return { success: false, error: err.message || 'Error de conexión' };
            }
        }
        return { success: true };
    }

    // --- Analytics Reales ---
    async recordTraffic(source) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const today = new Date().toISOString().split('T')[0];

                // Generar ID único de sesión temporal si no existe
                if (!sessionStorage.getItem('revista_visitor_id')) {
                    sessionStorage.setItem('revista_visitor_id', 'v_' + Math.random().toString(36).substring(2));
                }
                const isNewVisitor = !sessionStorage.getItem('revista_visitor_counted_' + today);

                // Get current stats for today
                let { data: stats } = await supabaseClient
                    .from('traffic_stats')
                    .select('*')
                    .eq('date', today)
                    .maybeSingle();

                if (!stats) {
                    stats = { date: today, page_views: 0, unique_visitors: 0, app_opens: 0, web_visits: 0 };
                    await supabaseClient.from('traffic_stats').insert([stats]);
                }

                // Prepare update payload
                const payload = { page_views: (stats.page_views || 0) + 1 };

                if (isNewVisitor) {
                    payload.unique_visitors = (stats.unique_visitors || 0) + 1;
                    sessionStorage.setItem('revista_visitor_counted_' + today, 'true');

                    if (source === 'pwa' || window.matchMedia('(display-mode: standalone)').matches) {
                        payload.app_opens = (stats.app_opens || 0) + 1;
                    } else {
                        payload.web_visits = (stats.web_visits || 0) + 1;
                    }
                }

                await supabaseClient.from('traffic_stats').update(payload).eq('date', today);
            } catch (err) {
                console.warn('Error recording traffic:', err);
            }
        }
    }


    async incrementViews(id) {
        // Evitar múltiples conteos por sesión para el mismo anuncio
        let viewedThisSession = [];
        try {
            viewedThisSession = JSON.parse(sessionStorage.getItem('revista_autos_viewed_session') || '[]');
        } catch (e) { }

        if (viewedThisSession.includes(String(id))) {
            const listings = this.getAllListings();
            const listing = listings.find(l => String(l.id) === String(id));
            return listing ? listing.views : 0;
        }

        viewedThisSession.push(String(id));
        sessionStorage.setItem('revista_autos_viewed_session', JSON.stringify(viewedThisSession));

        // Incrementamos localmente primero
        const listings = this.getAllListings();
        const listing = listings.find(l => String(l.id) === String(id));
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const now = new Date();
                const visit_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                const { error } = await supabaseClient.rpc('increment_visit', {
                    listing_id: id,
                    visit_date: visit_date
                });

                if (error) {
                    console.warn("Error RPC increment_visit, aplicando fallback local:", error.message);
                }
            } catch (err) {
                console.warn("Error de red incrementando vistas:", err);
            }
        }
        return listing ? listing.views : 0;
    }

    async updateReaction(id, reactionType, incrementVal) {
        console.log(`🎯 updateReaction llamado: id=${id}, type=${reactionType}, inc=${incrementVal}`);
        
        // Actualizamos localmente primero (listings propios / favoritos en localStorage)
        const listings = this.getAllListings();
        const listing = listings.find(l => String(l.id) === String(id));
        if (listing) {
            if (typeof listing.reactions === 'string') {
                try { listing.reactions = JSON.parse(listing.reactions); } catch (e) { listing.reactions = null; }
            }
            if (!listing.reactions || typeof listing.reactions !== 'object') {
                listing.reactions = { like: 0, love: 0, fire: 0, angry: 0 };
            }
            listing.reactions[reactionType] = Math.max(0, (listing.reactions[reactionType] || 0) + incrementVal);
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            console.log('📦 Actualizado en localStorage:', listing.reactions);
        } else {
            console.log('ℹ️ Listing NO está en localStorage (es del feed online)');
        }

        // Obtener las reactions actualizadas de la memoria viva (para el fallback directo)
        const getLiveReactions = () => {
            const liveItem = (typeof window.activeFeedListings !== 'undefined' && window.activeFeedListings.find(l => String(l.id) === String(id)))
                || (window.searchCascadeList && window.searchCascadeList.find(l => String(l.id) === String(id)))
                || (window.currentSearchContext && window.currentSearchContext.level1 && window.currentSearchContext.level1.find(l => String(l.id) === String(id)));
            if (liveItem && liveItem.reactions && typeof liveItem.reactions === 'object') {
                return { ...liveItem.reactions };
            }
            return listing ? { ...listing.reactions } : null;
        };

        // Persistir en Supabase (fuente de verdad global)
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const numericId = Number(id);
            if (isNaN(numericId)) {
                console.warn('⚠️ updateReaction: ID no numérico:', id);
                return;
            }

            // Estrategia 1: Intentar RPC (más eficiente, incrementa atómicamente)
            try {
                const { error } = await supabaseClient.rpc('update_reaction', {
                    listing_id: numericId,
                    reaction_type: reactionType,
                    increment_val: incrementVal
                });

                if (!error) {
                    console.log('✅ Reacción guardada en Supabase via RPC exitosamente');
                    return; // ¡Éxito! No necesitamos fallback
                }
                console.warn('⚠️ RPC update_reaction falló:', error.message, '→ Intentando fallback directo...');
            } catch (err) {
                console.warn('⚠️ RPC update_reaction error de red:', err.message, '→ Intentando fallback directo...');
            }

            // Estrategia 2: Fallback - UPDATE directo a la columna reactions con el objeto completo
            try {
                const liveReactions = getLiveReactions();
                if (liveReactions) {
                    console.log('🔄 Fallback: Enviando reactions completas a Supabase:', liveReactions);
                    const { error: updateError } = await supabaseClient
                        .from('listings')
                        .update({ reactions: liveReactions })
                        .eq('id', numericId);
                    
                    if (!updateError) {
                        console.log('✅ Reacción guardada en Supabase via UPDATE directo');
                        return;
                    }
                    console.error('❌ UPDATE directo también falló:', updateError.message);
                    console.error('👉 PROBABLE CAUSA: La columna "reactions" no existe en Supabase.');
                    console.error('👉 SOLUCIÓN: Ejecuta este SQL en el SQL Editor de Supabase:');
                    console.error(`   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{"like": 0, "love": 0, "fire": 0, "angry": 0}'::jsonb;`);
                    console.error(`   -- Y también crea la función RPC:`);
                    console.error(`   CREATE OR REPLACE FUNCTION update_reaction(listing_id BIGINT, reaction_type TEXT, increment_val INT) RETURNS void AS $$ BEGIN UPDATE public.listings SET reactions = jsonb_set(COALESCE(reactions, '{"like": 0, "love": 0, "fire": 0, "angry": 0}'::jsonb), array[reaction_type], to_jsonb(GREATEST(0, COALESCE((reactions->>reaction_type)::int, 0) + increment_val))) WHERE id = listing_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;`);
                } else {
                    console.warn('⚠️ No hay reactions en memoria viva para enviar como fallback');
                }
            } catch (e) {
                console.error('❌ Fallback directo completamente falló:', e);
            }
        } else {
            console.warn('⚠️ supabaseClient no disponible - reacciones solo en memoria local');
        }
    }

    async fetchTrafficStats() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('daily_visits')
                    .select('*')
                    .order('date', { ascending: true });

                if (error) {
                    console.warn("Error fetching daily_visits:", error.message);
                    return [];
                }
                return data || [];
            } catch (err) {
                console.warn("Error de red obteniendo daily_visits:", err);
                return [];
            }
        }
        return [];
    }

    async recordSaleHistory(listing) {
        if (!listing) return;
        const soldAt = listing.soldAt || listing.sold_at || new Date().toISOString();
        const saleRecord = {
            listing_id: listing.id,
            title: listing.title || `${listing.make || ''} ${listing.model || ''}`,
            make: listing.make || '',
            model: listing.model || '',
            year: listing.year || null,
            price: listing.price || null,
            city: listing.city || '',
            state: listing.state || '',
            seller_name: listing.sellerName || listing.seller_name || '',
            sold_at: soldAt,
            created_at: new Date().toISOString()
        };

        // Guardar localmente
        const localHistory = JSON.parse(localStorage.getItem('revista_autos_sales_history') || '[]');
        const alreadyExists = localHistory.some(s => String(s.listing_id) === String(listing.id));
        if (!alreadyExists) {
            localHistory.push(saleRecord);
            localStorage.setItem('revista_autos_sales_history', JSON.stringify(localHistory));
        }

        // Guardar en Supabase
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data: existing } = await supabaseClient
                    .from('sales_history')
                    .select('id')
                    .eq('listing_id', listing.id)
                    .maybeSingle();

                if (!existing) {
                    const { error } = await supabaseClient
                        .from('sales_history')
                        .insert([saleRecord]);
                    if (error) {
                        console.warn("Error guardando sales_history en Supabase:", error.message);
                    }
                }
            } catch (err) {
                console.warn("Error de red guardando sales_history:", err);
            }
        }
    }

    async fetchSalesHistory() {
        let serverSales = [];
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('sales_history')
                    .select('*')
                    .order('sold_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    serverSales = data;
                }
            } catch (err) {
                console.warn("Error de red obteniendo sales_history:", err);
            }
        }

        const localSales = JSON.parse(localStorage.getItem('revista_autos_sales_history') || '[]');
        const salesMap = new Map();

        serverSales.forEach(s => salesMap.set(String(s.listing_id || s.id), s));
        localSales.forEach(s => {
            const key = String(s.listing_id || s.id);
            if (!salesMap.has(key)) {
                salesMap.set(key, s);
            }
        });

        const combined = Array.from(salesMap.values());
        localStorage.setItem('revista_autos_sales_history', JSON.stringify(combined));
        return combined;
    }
    // ==========================================
    // SECCIÓN DE ANUNCIOS Y PUBLICIDAD (FASE 1)
    // ==========================================

    async syncAdsWithServer() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    const localAds = JSON.parse(localStorage.getItem('revista_autos_ads') || '[]');
                    const localAdsMap = new Map();
                    localAds.forEach(a => localAdsMap.set(String(a.id), a));

                    const normalizedAds = data.map(ad => {
                        const localAd = localAdsMap.get(String(ad.id));

                        let serverNotes = [];
                        if (ad.notes) {
                            try { serverNotes = typeof ad.notes === 'string' ? JSON.parse(ad.notes) : ad.notes; } catch (e) { serverNotes = []; }
                        }
                        let localNotes = localAd && Array.isArray(localAd.notes) ? localAd.notes : [];

                        const notesMap = new Map();
                        [...serverNotes, ...localNotes].forEach(n => {
                            if (n && n.text) {
                                const key = n.id || `${n.timestamp}_${n.text}`;
                                if (!notesMap.has(key)) notesMap.set(key, n);
                            }
                        });
                        const mergedNotes = Array.from(notesMap.values());

                        let socialLinks = [];
                        if (ad.social_links) {
                            try { socialLinks = typeof ad.social_links === 'string' ? JSON.parse(ad.social_links) : ad.social_links; } catch (e) { socialLinks = []; }
                        } else if (localAd && localAd.social_links) {
                            socialLinks = localAd.social_links;
                        }

                        let mergedAd = { ...ad };
                        if (localAd && localAd._pendingSync) {
                            mergedAd = { ...ad, ...localAd };
                            delete mergedAd._pendingSync;
                            delete localAd._pendingSync;
                            this.saveAd(localAd).catch(e => console.warn('Retry sync ad failed:', e));
                        }

                        return {
                            ...mergedAd,
                            scheduleMF: ad.scheduleMF || ad.schedulemf || '',
                            scheduleSat: ad.scheduleSat || ad.schedulesat || '',
                            scheduleSun: ad.scheduleSun || ad.schedulesun || '',
                            social_links: socialLinks,
                            notes: mergedNotes
                        };
                    });

                    const newAdsStr = JSON.stringify(normalizedAds);
                    const oldAdsStr = localStorage.getItem('revista_autos_ads');

                    if (newAdsStr !== oldAdsStr) {
                        localStorage.setItem('revista_autos_ads', newAdsStr);
                        if (typeof window.onAdsSynced === 'function') window.onAdsSynced();
                    }
                }
            } catch (err) {
                console.error('Error fetching ads from Supabase:', err);
            }
        }
    }

    getMyAds() {
        return this.getAllAds().filter(ad => ad.publisher_id === this.uuid || ad.isMyAd);
    }

    isAdActive(ad) {
        if (ad.is_active === false) return false;
        const now = new Date();
        if (ad.start_date && new Date(ad.start_date) > now) return false;
        if (ad.end_date && new Date(ad.end_date) < now) return false;
        return true;
    }

    getRandomAds(count, city = null, includeFallback = true) {
        let activeAds = this.getAllAds().filter(ad => this.isAdActive(ad));
        if (city) {
            const cities = Array.isArray(city) ? city : [city];
            const validCities = cities.filter(c => c && c !== 'Todas');
            if (validCities.length > 0) {
                activeAds = activeAds.filter(ad => ad.city && validCities.includes(ad.city));
            }
        }

        const limit = this.adFallbackLimit !== undefined ? this.adFallbackLimit : 21;
        let resultPool = [...activeAds];
        if (includeFallback && activeAds.length < limit) {
            resultPool.push(null);
        }

        return resultPool.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    addAdNote(id, noteText) {
        if (!noteText || !noteText.trim()) return null;
        const ads = this.getAllAds();
        const index = ads.findIndex(a => String(a.id) === String(id));
        if (index !== -1) {
            if (!ads[index].notes) {
                ads[index].notes = [];
            }
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

            const newNote = {
                id: Date.now(),
                timestamp: `${dateStr}, ${timeStr}`,
                text: noteText.trim()
            };
            ads[index].notes.unshift(newNote);
            localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
            this.saveAd(ads[index]);
            return newNote;
        }
        return null;
    }

    // Limpiar notas CRM de un listing al entrar a Renovaciones (nuevo ciclo)
    clearListingNotes(id) {
        const listings = this.getAllListings();
        const index = listings.findIndex(l => String(l.id) === String(id));
        if (index !== -1 && listings[index].notes && listings[index].notes.length > 0) {
            listings[index].notes = [];
            localStorage.setItem(this.listingsKey, JSON.stringify(listings));
            this.saveListing(listings[index]); // Sincroniza con Supabase en background
            return true;
        }
        return false;
    }

    // Limpiar notas CRM de un anuncio al entrar a Renovaciones (nuevo ciclo)
    clearAdNotes(id) {
        const ads = this.getAllAds();
        const index = ads.findIndex(a => String(a.id) === String(id));
        if (index !== -1 && ads[index].notes && ads[index].notes.length > 0) {
            ads[index].notes = [];
            localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
            this.saveAd(ads[index]); // Sincroniza con Supabase en background
            return true;
        }
        return false;
    }


    async incrementAdViews(adId) {
        let ad = this.getAllAds().find(a => String(a.id) === String(adId));
        if (!ad) return null;

        // Evitar múltiples conteos por sesión para la misma publicidad
        let viewedThisSession = [];
        try {
            viewedThisSession = JSON.parse(sessionStorage.getItem('revista_ads_viewed_session') || '[]');
        } catch (e) { }

        if (viewedThisSession.includes(String(adId))) {
            return ad;
        }

        viewedThisSession.push(String(adId));
        sessionStorage.setItem('revista_ads_viewed_session', JSON.stringify(viewedThisSession));

        ad.views = (ad.views || 0) + 1;
        const ads = this.getAllAds();
        const idx = ads.findIndex(a => String(a.id) === String(adId));
        if (idx > -1) {
            ads[idx].views = ad.views;
            localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
            ad = ads[idx]; // update reference
        }

        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            // Fire and forget
            supabaseClient.from('ads').update({ views: ad.views }).eq('id', adId).then(({ error }) => {
                if (error) console.warn("Error updating ad views in supabase:", error);
            });
        }
        return ad;
    }

    async incrementAdClicks(adId) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const ad = this.getAllAds().find(a => String(a.id) === String(adId));
            if (ad) {
                ad.clicks = (ad.clicks || 0) + 1;
                await supabaseClient.from('ads').update({ clicks: ad.clicks }).eq('id', adId);
                const ads = this.getAllAds();
                const idx = ads.findIndex(a => String(a.id) === String(adId));
                if (idx > -1) {
                    ads[idx].clicks = ad.clicks;
                    localStorage.setItem('revista_autos_ads', JSON.stringify(ads));
                }
            }
        }
    }

    // ============================================
    // AUDIT LOG (BITÁCORA DE ACTIVIDAD)
    // ============================================

    async logActivity(action, reference, city = 'N/A') {
        const currentUser = window.currentAdminUser;
        if (!currentUser) return null;

        const payload = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user_username: currentUser.username || 'Desconocido',
            user_role: currentUser.role || 'Desconocido',
            action: action,
            reference: reference,
            city: city
        };

        // Guardar localmente
        const logs = JSON.parse(localStorage.getItem('revista_activity_logs') || '[]');
        logs.unshift(payload); // Insert at beginning
        if (logs.length > 500) logs.length = 500; // Keep only last 500 locally
        localStorage.setItem('revista_activity_logs', JSON.stringify(logs));

        // Subir a supabase
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                // If the table 'activity_logs' doesn't exist, this might fail silently,
                // but local logs will still work.
                await supabaseClient.from('activity_logs').insert([payload]);
            } catch (err) {
                console.warn('Error saving activity log to Supabase:', err);
            }
        }

        return payload;
    }

    async getAuditLogs() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('activity_logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(200);

                if (!error && data) {
                    // Normalize data just in case
                    const normalized = data.map(log => ({
                        id: log.id,
                        timestamp: log.timestamp || log.created_at,
                        user_username: log.user_username || log.user,
                        user_role: log.user_role || log.role,
                        action: log.action,
                        reference: log.reference || log.details || 'N/A',
                        city: log.city || 'N/A'
                    }));
                    localStorage.setItem('revista_activity_logs', JSON.stringify(normalized));
                    return { success: true, logs: normalized };
                }
            } catch (err) {
                console.warn('Error fetching activity logs from Supabase:', err);
            }
        }

        // Fallback to local
        const logs = JSON.parse(localStorage.getItem('revista_activity_logs') || '[]');
        return { success: true, logs: logs };
    }
}

const db = new Database();
window.db = db; // Exponer globalmente para que toggleSocialReaction y otros handlers inline puedan acceder

