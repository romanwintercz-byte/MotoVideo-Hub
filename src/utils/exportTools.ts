import { RideProject } from '../types';

export function exportToDaVinciCSV(project: RideProject) {
  // První řádek: Hlavička tabulky definovaná systémem DaVinci Resolve
  let csvContent = "Marker Name,Description,In,Out,Duration,Marker Type,Color\n";
  
  project.highlights.forEach((hl, index) => {
    // 1. Zpracování času na DaVinci formát
    // Uživatel zadá "01:45" (minuty:vteřiny), my uděláme "00:01:45:00" (hodiny:minuty:vteřiny:snímky)
    let timeStr = hl.time.trim();
    const parts = timeStr.split(':');
    let h = '00', m = '00', s = '00';
    
    if (parts.length === 2) {
        m = parts[0].padStart(2, '0');
        s = parts[1].padStart(2, '0');
    } else if (parts.length === 3) {
        h = parts[0].padStart(2, '0');
        m = parts[1].padStart(2, '0');
        s = parts[2].padStart(2, '0');
    } else {
        // Pokud formát nesouhlasí, aspoň tam pošleme nulu, ať to nespadne
        m = '00'; s = '00';
    }
    const timecode = `${h}:${m}:${s}:00`;
    
    // 2. Barvy značek podle kamery
    // front = Blue, rear = Red, dual = Purple
    const color = hl.camera === 'front' ? 'Blue' : hl.camera === 'rear' ? 'Red' : 'Purple';
    
    // 3. Obsah značky
    const markerName = `Znacka ${index + 1} (${hl.sourceFile})`;
    const description = `${hl.note} [Pohled: ${hl.camera === 'front' ? 'Predni' : hl.camera === 'rear' ? 'Zadni' : 'Obe'} / Soubor: ${hl.sourceFile}]`;
    
    // Sestavíme řádek tabulky
    csvContent += `"${markerName}","${description}","${timecode}","${timecode}",1,"Marker 1","${color}"\n`;
  });
  
  // Vygenerujeme soubor ke stažení
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  
  // Jméno souboru: "Slapy_DaVinci_Markers.csv"
  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_');
  link.setAttribute("download", `${safeTitle}_DaVinci_Markers.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function backupDatabase(projects: RideProject[]) {
  // Stáhne veškerá data aplikace do .json souboru
  const data = JSON.stringify(projects, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MotoVideoHub_Zaloha_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
