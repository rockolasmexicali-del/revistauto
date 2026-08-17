const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'database.json');

// Semillas iniciales por defecto
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
        'Bajaj': ['Pulsar NS200', 'Pulsar N250', 'Dominar 400', 'Platina 110', 'Avenger 220', 'Boxer 150', 'Chetak'],
        'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga', 'Mulsanne'],
        'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'i4', 'iX', 'R 1250 GS', 'S 1000 RR', 'G 310 R', 'F 850 GS'],
        'Buick': ['Encore', 'Envision', 'Enclave', 'Regal', 'Verano', 'LaCrosse'],
        'BYD': ['Dolphin', 'Seal', 'Yuan Plus', 'Han', 'Tang', 'Song Plus', 'Seagull', 'King'],
        'Cadillac': ['XT4', 'XT5', 'XT6', 'Escalade', 'CT4', 'CT5', 'Lyriq', 'CTS'],
        'Can-Am': ['Maverick X3', 'Defender', 'Outlander', 'Renegade', 'Commander', 'Spyder', 'Ryker'],
        'CFMoto': ['450SR', '650NK', '800NK', '300NK', 'CFORCE 450', 'CFORCE 600', 'CFORCE 1000', 'UFORCE 1000', 'ZFORCE 950'],
        'Changan': ['Alsvin', 'CS35 Plus', 'CS55 Plus', 'CS75 Plus', 'UNI-K', 'UNI-T', 'Hunter'],
        'Chevrolet': ['Aveo', 'Beat', 'Cheyenne', 'Silverado', 'Trax', 'Captiva', 'Tracker', 'Suburban', 'Tahoe', 'Equinox', 'Colorado', 'Blazer', 'Cavalier', 'Onix', 'S10', 'Tornado', 'Camaro', 'Corvette', 'Cruze', 'Spark', 'Malibu'],
        'Chirey': ['Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Omoda 5', 'Arrizo 8'],
        'Chrysler': ['300', 'Pacifica', 'Voyager', 'Town & Country', '200', 'Aspen', 'PT Cruiser'],
        'Cupra': ['Formentor', 'Leon', 'Ateca', 'Born', 'Tavascan'],
        'Dodge': ['Attitude', 'Charger', 'Challenger', 'Durango', 'Journey', 'Neon', 'Dart', 'Ram 1500', 'Viper', 'Grand Caravan'],
        'Ducati': ['Panigale V4', 'Monster', 'Multistrada', 'Scrambler', 'Streetfighter V4', 'Diavel 1260', 'Hypermotard', 'DesertX'],
        'Ferrari': ['488', 'F8 Tributo', 'Roma', 'SF90 Stradale', 'Portofino', '812 Superfast', '296 GTB', 'Purosangue', '458 Italia', 'California'],
        'Fiat': ['Mobi', 'Argo', 'Fastback', 'Pulse', '500', 'Uno', 'Strada', 'Ducato', 'Palio', 'Siena'],
        'Ford': ['Mustang', 'Lobo', 'Ranger', 'Explorer', 'Figo', 'F-150', 'F-250', 'F-350', 'F-450', 'F-550', 'Bronco', 'Edge', 'Expedition', 'Escape', 'Transit', 'Territory', 'Maverick', 'Focus', 'Fiesta', 'Fusion', 'EcoSport'],
        'Foton': ['Auman', 'Aumark', 'Tunland', 'View CS2', 'Gratour', 'Toano'],
        'Freightliner': ['Cascadia', 'M2 106', 'Columbia', 'FLD', 'Business Class M2', 'Coronado', '114SD', 'Century Class'],
        'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'],
        'GMC': ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Canyon', 'Savana', 'Hummer EV'],
        'GWM': ['Haval H6', 'Haval Jolion', 'Ora 03', 'Tank 300', 'Poer'],
        'Harley-Davidson': ['Sportster S', 'Iron 883', 'Street Glide', 'Road Glide', 'Fat Boy', 'Heritage Classic', 'Pan America 1250', 'Softail', 'Road King'],
        'Hero': ['Thruster', 'Hunk 160R', 'Xpulse 200', 'Dash 125', 'Eco 150'],
        'Hino': ['300 Series', '500 Series', '195', '268', '338', 'L6', 'L7', 'XL7', 'XL8'],
        'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'BR-V', 'Odyssey', 'City', 'Fit', 'Ridgeline', 'CBR600RR', 'CBR1000RR', 'CRF250L', 'XR150L', 'NAVI', 'Dio 110', 'CB190R'],
        'Hummer': ['H1', 'H2', 'H3', 'EV'],
        'Hyundai': ['Grand i10', 'Elantra', 'Accent', 'Creta', 'Tucson', 'Santa Fe', 'Sonata', 'Kona', 'Palisade', 'Venue', 'Staria', 'Veloster', 'Ioniq 5'],
        'Indian Motorcycle': ['Scout', 'Chief', 'FTR 1200', 'Challenger', 'Roadmaster', 'Chieftain'],
        'Infiniti': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80', 'G37'],
        'International': ['ProStar', 'LT Series', 'LoneStar', 'MV Series', 'WorkStar', 'Durastar', 'TransStar', '4300', '9400', 'HX Series'],
        'Isuzu': ['NPR', 'NQR', 'NRR', 'FTR', 'FVR', 'ELF 200', 'ELF 300', 'ELF 400', 'D-Max', 'Rodeo'],
        'Italika': ['FT125', 'FT150', 'DM200', 'DM250', 'VX250', 'WS150', 'Vortex 300', 'Vort-X 200', 'AT110', 'D125', 'RT200'],
        'JAC': ['Frison T6', 'Frison T8', 'Sei 2', 'Sei 3', 'Sei 4 Pro', 'Sunray', 'X200', 'E10X', 'J7'],
        'JAECOO': ['J7', 'J8'],
        'Jaguar': ['F-PACE', 'E-PACE', 'I-PACE', 'F-TYPE', 'XE', 'XF', 'XJ'],
        'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Commander', 'Wagoneer', 'Liberty', 'Patriot'],
        'Jetour': ['Dashing', 'X70', 'X70 Plus', 'X90 Plus'],
        'Kawasaki': ['Ninja 400', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Z650', 'Z900', 'Versys 650', 'KX250', 'Mule', 'Teryx', 'KLX300'],
        'Kenworth': ['T680', 'T880', 'W900', 'K270', 'K370', 'T370', 'T470', 'T270', 'T380', 'T480', 'W990'],
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
        'Nissan': ['Versa', 'Sentra', 'March', 'Frontier', 'NP300', 'Kicks', 'X-Trail', 'Altima', 'Pathfinder', 'Armada', 'Note', 'Maxima', 'Urvan', '370Z', 'GT-R', 'Tilda', 'Juke', 'Murano'],
        'Omoda': ['Omoda C5', 'Omoda O5', 'Omoda O5 GT'],
        'Peugeot': ['208', '301', '2008', '3008', '5008', 'Partner', 'Manager', 'Expert', 'Rifter', '308', '508'],
        'Peterbilt': ['389', '579', '567', '337', '348', '520', '379', '536', '548', '567 Heritage'],
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
        'Suzuki': ['Ignis', 'Swift', 'Baleno', 'Ertiga', 'Jimny', 'Vitara', 'S-Cross', 'Grand Vitara', 'AX100', 'GSX-R600', 'V-Strom 650', 'KingQuad 750', 'Boulevard', 'Gixxer 150', 'Intruder'],
        'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
        'Toyota': ['Yaris', 'Corolla', 'Camry', 'Prius', 'Avanza', 'Corolla Cross', 'RAV4', 'Highlander', 'Sienna', 'Hilux', 'Tacoma', 'Tundra', '4Runner', 'Sequoia', 'Supra', 'Land Cruiser', 'Hiace', 'C-HR', '86'],
        'Triumph': ['Street Triple', 'Bonneville', 'Tiger 900', 'Trident 660', 'Speed Triple', 'Scrambler 1200', 'Rocket 3'],
        'TVS': ['Apache RTR 200', 'NTorq 125', 'Raider 125', 'Sport 100', 'Star City'],
        'Veloci': ['Razzer 200', 'Hasport 250', 'Xeverus 250', 'Stealth 200', 'Aggressor 250', 'Boxer 150'],
        'Vento': ['Nitrox 250', 'Hyper 280', 'Crossmax 250', 'Screamer 250', 'Rocketman 250', 'Falkon 200', 'Workman 250', 'Alpina 300'],
        'Volkswagen': ['Polo', 'Vento', 'Virtus', 'Jetta', 'Golf', 'Nivus', 'T-Cross', 'Taos', 'Tiguan', 'Teramont', 'Atlas', 'Amarok', 'Saveiro', 'Transporter', 'Crafter', 'Beetle', 'Passat', 'Golf GTI', 'Derby'],
        'Volvo': ['S60', 'S90', 'V60', 'XC40', 'XC60', 'XC90', 'C40', 'VNL', 'VNR', 'FH', 'FM', 'EX30'],
        'Yamaha': ['R6', 'MT-07', 'Fz-S', 'YZF-R1', 'Tenere 700', 'NMAX', 'R3', 'YFZ450R', 'Grizzly 700', 'Raptor 700', 'YXZ1000R', 'Crypton 110', 'YBR125', 'MT-09', 'MT-03', 'XMAX']
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
    states: ['Baja California', 'Sonora', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Querétaro', 'Yucatán', 'Quintana Roo', 'Ciudad de México'],
    citiesByState: {
        'Baja California': ['Mexicali', 'Tijuana', 'Ensenada', 'Rosarito', 'Tecate'],
        'Sonora': ['Hermosillo', 'Nogales', 'Guaymas', 'Cajeme', 'Navojoa'],
        'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Puerto Vallarta'],
        'Nuevo León': ['Monterrey', 'San Pedro', 'Guadalupe'],
        'Puebla': ['Puebla', 'Cholula', 'Tehuacán'],
        'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Guanajuato'],
        'Querétaro': ['Querétaro', 'San Juan del Río'],
        'Yucatán': ['Mérida', 'Valladolid'],
        'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Tulum'],
        'Ciudad de México': ['Ciudad de México']
    }
};

const initialListings = [
    {
        id: 1,
        title: 'Toyota Corolla 2021',
        type: 'Sedán',
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        price: 350000,
        city: 'Ciudad de México',
        images: ['https://images.unsplash.com/photo-1590362891991-f766f5f76b4a?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 45
    },
    {
        id: 2,
        title: 'Ford Ranger XLT 2020',
        type: 'Pickup',
        make: 'Ford',
        model: 'Ranger',
        year: 2020,
        price: 480000,
        city: 'Monterrey',
        images: ['https://images.unsplash.com/photo-1552251329-a1b7e4f9b8c0?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 120
    },
    {
        id: 3,
        title: 'Yamaha MT-07 2022',
        type: 'Motocicleta',
        make: 'Yamaha',
        model: 'MT-07',
        year: 2022,
        price: 185000,
        city: 'Guadalajara',
        images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 89
    },
    {
        id: 4,
        title: 'Honda CR-V 2019',
        type: 'Camioneta',
        make: 'Honda',
        model: 'CR-V',
        year: 2019,
        price: 395000,
        city: 'Ciudad de México',
        images: ['https://images.unsplash.com/photo-1512316664917-0639ee853d99?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 205
    },
    {
        id: 5,
        title: 'Volkswagen Jetta 2023',
        type: 'Sedán',
        make: 'Volkswagen',
        model: 'Jetta',
        year: 2023,
        price: 420000,
        city: 'Puebla',
        images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 65
    },
    {
        id: 6,
        title: 'Chevrolet Silverado 2018',
        type: 'Pickup',
        make: 'Chevrolet',
        model: 'Silverado',
        year: 2018,
        price: 550000,
        city: 'Hermosillo',
        images: ['https://images.unsplash.com/photo-1600706240248-8df042e88a38?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 110
    },
    {
        id: 7,
        title: 'Sea-Doo Spark 2021',
        type: 'Barco',
        make: 'Sea-Doo',
        model: 'Spark',
        year: 2021,
        price: 150000,
        city: 'Cancún',
        images: ['https://images.unsplash.com/photo-1598282361426-3023021dd9f6?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 320
    },
    {
        id: 8,
        title: 'Kenworth T680 2015',
        type: 'Camión',
        make: 'Kenworth',
        model: 'T680',
        year: 2015,
        price: 1200000,
        city: 'Tijuana',
        images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 45
    },
    {
        id: 9,
        title: 'BMW Serie 3 2022',
        type: 'Sedán',
        make: 'BMW',
        model: 'Serie 3',
        year: 2022,
        price: 850000,
        city: 'Ciudad de México',
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 290
    },
    {
        id: 10,
        title: 'Nissan Frontier 2021',
        type: 'Pickup',
        make: 'Nissan',
        model: 'Frontier',
        year: 2021,
        price: 520000,
        city: 'León',
        images: ['https://images.unsplash.com/photo-1591864197771-46df2c7009e5?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 75
    },
    {
        id: 11,
        title: 'Audi Q5 2020',
        type: 'Camioneta',
        make: 'Audi',
        model: 'Q5',
        year: 2020,
        price: 780000,
        city: 'Querétaro',
        images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 180
    },
    {
        id: 12,
        title: 'Suzuki Swift 2023',
        type: 'Hatchback',
        make: 'Suzuki',
        model: 'Swift',
        year: 2023,
        price: 299000,
        city: 'Mérida',
        images: ['https://images.unsplash.com/photo-1629897048514-3dd74143275d?auto=format&fit=crop&w=600&q=80'],
        status: 'autorizado',
        isMyListing: false,
        views: 210
    }
];

const usersFilePath = path.join(dataDir, 'users.json');

// ...
class BackendDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(dbFilePath)) {
            const initialData = {
                listings: initialListings,
                catalog: defaultCatalogData,
                suggestions: [],
                settings: { monthlyPrice: 500, adMonthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '', ads_enabled: true, ad_frequency_scroll: 10, ad_fallback_limit: 21 }
            };
            fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
        }
        if (!fs.existsSync(usersFilePath)) {
            const initialUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: '123', // TODO: Hash in production
                    role: 'admin',
                    allowedStates: [],
                    allowedCities: []
                }
            ];
            fs.writeFileSync(usersFilePath, JSON.stringify(initialUsers, null, 2), 'utf-8');
        }
    }

    readDB() {
        try {
            const content = fs.readFileSync(dbFilePath, 'utf-8');
            const data = JSON.parse(content);
            if (!data.settings) data.settings = { monthlyPrice: 500, adMonthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '', ads_enabled: true, ad_frequency_scroll: 10, ad_fallback_limit: 21 };
            return data;
        } catch (e) {
            console.error('Error leyendo base de datos:', e);
            return { listings: [], catalog: defaultCatalogData, suggestions: [], settings: { monthlyPrice: 500, adMonthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '', ads_enabled: true, ad_frequency_scroll: 10, ad_fallback_limit: 21 } };
        }
    }

    writeDB(data) {
        try {
            fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (e) {
            console.error('Error escribiendo en base de datos:', e);
            return false;
        }
    }

    readUsers() {
        try {
            const content = fs.readFileSync(usersFilePath, 'utf-8');
            return JSON.parse(content);
        } catch(e) {
            console.error('Error leyendo users.json:', e);
            return [];
        }
    }

    writeUsers(users) {
        try {
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
            return true;
        } catch(e) {
            console.error('Error escribiendo users.json:', e);
            return false;
        }
    }

    getUserByUsername(username) {
        return this.readUsers().find(u => u.username === username);
    }
    
    getUserById(id) {
        return this.readUsers().find(u => u.id === Number(id));
    }
    
    getAllUsers() {
        return this.readUsers();
    }
    
    createUser(userData) {
        const users = this.readUsers();
        if (users.find(u => u.username === userData.username)) {
            throw new Error('El nombre de usuario ya existe');
        }
        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            role: userData.role || 'empleado',
            allowedStates: userData.allowedStates || [],
            allowedCities: userData.allowedCities || []
        };
        users.push(newUser);
        this.writeUsers(users);
        return { ...newUser, password: undefined };
    }
    
    updateUser(id, userData) {
        const users = this.readUsers();
        const index = users.findIndex(u => u.id === Number(id));
        if (index === -1) throw new Error('Usuario no encontrado');
        
        if (userData.username && userData.username !== users[index].username) {
            if (users.find(u => u.username === userData.username)) {
                throw new Error('El nombre de usuario ya existe');
            }
        }
        
        const updatedUser = { ...users[index], ...userData };
        users[index] = updatedUser;
        this.writeUsers(users);
        return { ...updatedUser, password: undefined };
    }
    
    deleteUser(id) {
        let users = this.readUsers();
        users = users.filter(u => u.id !== Number(id));
        this.writeUsers(users);
        return true;
    }

    getAllListings() {
        return this.readDB().listings || [];
    }

    getSettings() {
        return this.readDB().settings || { monthlyPrice: 500, adMonthlyPrice: 500, mercadoPagoEnabled: false, mpPublicKey: '', mpAccessToken: '', ads_enabled: true, ad_frequency_scroll: 10, ad_fallback_limit: 21 };
    }

    updateSettings(newSettings) {
        const db = this.readDB();
        db.settings = { ...db.settings, ...newSettings };
        this.writeDB(db);
        return db.settings;
    }

    isActiveListing(l) {
        if (l.status !== 'autorizado') return false;

        // Rolling billing: priorizar expiresAt si existe
        if (l.expiresAt) {
            return new Date(l.expiresAt) > new Date();
        }

        // Fallback para publicaciones antiguas con lastRenewedMonth
        if (l.lastRenewedMonth) {
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            return l.lastRenewedMonth >= currentMonthStr;
        }

        // Sin fecha de vencimiento = publicación de prueba/demo, siempre activa
        return true;
    }

    getListingById(id) {
        const idNum = Number(id);
        const listings = this.getAllListings();
        return listings.find(l => l.id === idNum);
    }

    saveListing(listingData) {
        const db = this.readDB();
        const listings = db.listings || [];

        if (listingData.id) {
            const index = listings.findIndex(l => l.id === Number(listingData.id));
            if (index !== -1) {
                listings[index] = { ...listings[index], ...listingData };
                db.listings = listings;
                this.writeDB(db);
                return listings[index];
            }
        }

        const newListing = {
            id: listingData.id ? Number(listingData.id) : Date.now(),
            title: listingData.title || `${listingData.make} ${listingData.model} ${listingData.year}`,
            type: listingData.type || 'Sedán',
            make: listingData.make || 'Desconocido',
            model: listingData.model || 'Desconocido',
            year: Number(listingData.year) || new Date().getFullYear(),
            price: Number(listingData.price) || 0,
            color: listingData.color || '',
            city: listingData.city || 'Ciudad de México',
            state: listingData.state || '',
            phone: listingData.phone || '',
            whatsapp: listingData.whatsapp || '',
            engine: listingData.engine || '',
            transmission: listingData.transmission || '',
            ac: listingData.ac || '',
            mileage: listingData.mileage || '',
            legal: listingData.legal || '',
            images: listingData.images || ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'],
            status: listingData.status || 'pendiente autorizacion',
            publisherId: listingData.publisherId || '',
            isMyListing: true,
            views: 0,
            paymentStatus: listingData.paymentStatus || 'pending',
            createdAt: new Date().toISOString()
        };

        listings.push(newListing);
        db.listings = listings;
        this.writeDB(db);
        return newListing;
    }

    updateListing(id, updatedFields) {
        const idNum = Number(id);
        const db = this.readDB();
        const index = db.listings.findIndex(l => l.id === idNum);
        if (index !== -1) {
            db.listings[index] = { ...db.listings[index], ...updatedFields };
            this.writeDB(db);
            return db.listings[index];
        }
        return null;
    }

    incrementViews(id) {
        const idNum = Number(id);
        const db = this.readDB();
        const listing = db.listings.find(l => l.id === idNum);
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            this.writeDB(db);
            return listing.views;
        }
        return 0;
    }

    deleteListing(id) {
        const idNum = Number(id);
        const db = this.readDB();
        const listing = db.listings.find(l => l.id === idNum);
        if (listing) {
            db.listings = db.listings.filter(l => l.id !== idNum);
            this.writeDB(db);
            return listing;
        }
        return null;
    }

    markAsSold(id) {
        return this.updateListing(id, { status: 'vendido' });
    }

    approveListing(id) {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        // Rolling billing: expiresAt = hoy + 30 días exactos
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);
        const listing = this.updateListing(id, { 
            status: 'autorizado',
            lastRenewedMonth: currentMonthStr, // mantener para compatibilidad
            expiresAt: expiresAt.toISOString(),
            publishedAt: now.toISOString() // fecha de publicación visible al usuario
        });
        if (listing) {
            this.addSuggestion('make', listing.make);
            this.addSuggestion('model', listing.model, listing.make);
            if (listing.type) this.addSuggestion('type', listing.type);
            if (listing.color) this.addSuggestion('color', listing.color);
        }
        return listing;
    }

    renewListing(id) {
        const existing = this.getListingById(id);
        if (!existing) return null;
        const now = new Date();
        // Si aún no ha vencido, extender desde la fecha de vencimiento actual; si ya venció, desde hoy
        const baseDate = existing.expiresAt && new Date(existing.expiresAt) > now
            ? new Date(existing.expiresAt)
            : now;
        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + 30);
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return this.updateListing(id, {
            expiresAt: newExpiry.toISOString(),
            lastRenewedMonth: currentMonthStr, // mantener para compatibilidad
            status: 'autorizado'
        });
    }

    addListingNote(id, note) {
        const db = this.readDB();
        const idNum = Number(id);
        const index = db.listings.findIndex(l => l.id === idNum);
        if (index !== -1) {
            if (!db.listings[index].notes) {
                db.listings[index].notes = [];
            }
            db.listings[index].notes.unshift(note);
            this.writeDB(db);
            return note;
        }
        return null;
    }

    // method: 'mercadopago' | 'manual'
    addPayment(listingId, amount, receiptImage, type = 'Aprobación', method = 'manual') {
        const idNum = Number(listingId);
        const db = this.readDB();
        const index = db.listings.findIndex(l => l.id === idNum);
        if (index === -1) return null;

        if (!db.listings[index].payments) {
            db.listings[index].payments = [];
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

        const newPayment = {
            id: Date.now(),
            date: dateStr,
            dateISO: now.toISOString(),
            amount: Number(amount) || 0,
            receiptImage: receiptImage || null,
            type: type,
            method: method // 'mercadopago' | 'manual'
        };

        db.listings[index].payments.push(newPayment);
        this.writeDB(db);
        return newPayment;
    }

    getAllPayments() {
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
        return allPayments.sort((a, b) => b.timestamp - a.timestamp);
    }


    search(criteria) {
        let results = this.getAllListings().filter(l => this.isActiveListing(l));
        
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
            results = results.filter(l => Number(l.year) >= Number(criteria.minYear));
        }
        if (criteria.maxYear) {
            results = results.filter(l => Number(l.year) <= Number(criteria.maxYear));
        }
        if (criteria.transmission && criteria.transmission !== 'Todas') {
            results = results.filter(l => l.transmission === criteria.transmission);
        }
        if (criteria.legal && criteria.legal !== 'Todas') {
            if (criteria.legal === 'Nacional') {
                results = results.filter(l => ['Nacional', 'Nacional A1', 'Nacional VU'].includes(l.legal));
            } else {
                results = results.filter(l => l.legal === criteria.legal);
            }
        }
        if (criteria.color && criteria.color !== 'Todos') {
            results = results.filter(l => l.color === criteria.color);
        }
        return results;
    }

    getCatalog() {
        return this.readDB().catalog || defaultCatalogData;
    }

    getSuggestions() {
        return this.readDB().suggestions || [];
    }

    addSuggestion(type, value, parentMake = null) {
        if (!value || value.trim() === '') return;
        const valTrim = value.trim();
        const db = this.readDB();
        const suggestions = db.suggestions || [];
        const catalog = db.catalog || defaultCatalogData;

        let existing = suggestions.find(s => s.type === type && s.value.toLowerCase() === valTrim.toLowerCase() && s.parentMake === parentMake);
        if (existing) {
            existing.count += 1;
        } else {
            existing = {
                id: Date.now() + Math.random(),
                type: type,
                value: valTrim,
                parentMake: parentMake,
                count: 1,
                status: 'pending'
            };
            suggestions.push(existing);
        }

        if (existing.count >= 2 && existing.status !== 'approved') {
            existing.status = 'approved';
            if (existing.type === 'make') {
                if (!catalog.makes.includes(existing.value)) {
                    catalog.makes.push(existing.value);
                    catalog.modelsByMake[existing.value] = catalog.modelsByMake[existing.value] || [];
                }
            } else if (existing.type === 'model' && existing.parentMake) {
                catalog.modelsByMake[existing.parentMake] = catalog.modelsByMake[existing.parentMake] || [];
                if (!catalog.modelsByMake[existing.parentMake].includes(existing.value)) {
                    catalog.modelsByMake[existing.parentMake].push(existing.value);
                }
            } else if (existing.type === 'type') {
                if (!catalog.types.includes(existing.value)) {
                    catalog.types.push(existing.value);
                }
            } else if (existing.type === 'color') {
                if (!catalog.colors) catalog.colors = [];
                if (!catalog.colors.includes(existing.value)) {
                    catalog.colors.push(existing.value);
                }
            }
        }

        db.suggestions = suggestions;
        db.catalog = catalog;
        this.writeDB(db);
    }

    getActiveLocations() {
        const activeListings = this.getAllListings().filter(l => this.isActiveListing(l));
        const activeStates = new Set();
        const activeCitiesByState = {};
        const catalog = this.getCatalog();

        activeListings.forEach(l => {
            let state = l.state;
            const city = l.city;
            
            if (!state && city) {
                for (const s of catalog.states) {
                    if (catalog.citiesByState[s] && catalog.citiesByState[s].includes(city)) {
                        state = s;
                        break;
                    }
                }
            }

            if (state && city) {
                activeStates.add(state);
                if (!activeCitiesByState[state]) {
                    activeCitiesByState[state] = new Set();
                }
                activeCitiesByState[state].add(city);
            }
        });

        const resultStates = Array.from(activeStates).sort();
        const resultCitiesByState = {};
        for (const state in activeCitiesByState) {
            resultCitiesByState[state] = Array.from(activeCitiesByState[state]).sort();
        }

        return {
            states: resultStates,
            citiesByState: resultCitiesByState
        };
    }

    getStats() {
        const listings = this.getAllListings();
        const active = listings.filter(l => this.isActiveListing(l)).length;
        const sold = listings.filter(l => l.status === 'vendido').length;
        const pending = listings.filter(l => l.status === 'pendiente autorizacion').length;
        const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

        return {
            totalViews,
            activeListings: active,
            soldListings: sold,
            pendingApprovals: pending
        };
    }
}

module.exports = new BackendDatabase();
