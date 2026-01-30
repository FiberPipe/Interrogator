function cleanJSON(str) {
    let result = str.trim();
    
    // 1. Удаляем пробелы внутри чисел
    result = result
        .replace(/(\d)\s+(\d)/g, '$1$2')           // "123 456" → "123456"
        .replace(/(\d)\s+\./g, '$1.')              // "1 .5" → "1.5"
        .replace(/\.\s+(\d)/g, '.$1');             // ". 5" → ".5"
    
    // 2. Удаляем пробелы внутри ключей: "P11 " → "P11"
    // Паттерн: "ключ с пробелами":значение
    result = result.replace(/"([^"]+)"\s*:/g, (match, key) => {
        const cleanedKey = key.trim();
        return `"${cleanedKey}":`;
    });
    
    // 3. Удаляем длинные последовательности пробелов
    result = result.replace(/\s{10,}/g, ' ');
    
    // 4. Убираем пробелы вокруг JSON-разделителей
    result = result.replace(/\s*([,:{}[\]])\s*/g, '$1');
    
    return result;
}

function parse(t) {
    try {
        const cleaned = cleanJSON(t);
        
        if (cleaned.length > 150) {
            console.log('🧹 Cleaned (preview):', cleaned.substring(0, 150) + '...');
        }
        
        const result = JSON.parse(cleaned);
        console.log('✅ Parsed successfully');
        
        return result;
        
    } catch(e) {
        console.error('❌ Parse error:', e.message);
        
        const posMatch = e.message.match(/position (\d+)/);
        if (posMatch) {
            const pos = parseInt(posMatch[1]);
            const cleaned = cleanJSON(t);
            
            console.error('\n📍 Error at position', pos);
            console.error('Context:', cleaned.substring(Math.max(0, pos - 40), pos + 40));
            console.error('        ', ' '.repeat(40) + '↑');
        }
        
        return null;
    }
}



console.log(parse(`{"id_record":1,"time":"00:00:03.028","P0":1.572263,"stdDev0":0.24,"P1":1.648827,"stdDev1":0.212271,"P2":1.706329,"stdDev2":0.173093,"P3":1.757796,"stdDev3":0.136793,"P4":1.763196,"stdDev4":0.08581,"P5":1.775904,"stdDev5":0.06726,"P6":1.753983,"stdDev6":0.121505,"P7":1.625318,"stdDev7":0.15245,"P8":1.481403,"stdDev8":0.198654,"P9":1.453446,"stdDev9":0.219105,"P10":1.417546,"stdDev10":0.240757,"P11":1.381012,"stdDev11":0.251141,"P12":1.333675,"stdDev12":0.258311,"P13":1.300318,"stdDev13":0.256255,"P14":1.267595,"stdDev14":0.247053,"P15":1.337806,"stdDev15":0.222579}`))

console.log(parse(`{"id_record":1,"time":"00:00:03.028","P0":1.572263,"stdDev0":0.24,"P1":1.648827                                                                                                                                                             ,"stdDev1":0.212271,"P2":1.706329,"stdDev2":0.173093,"P3":1.757796,"stdDev3":0.1                                                                                                                                                             36793,"P4":1.763196,"stdDev4":0.08581,"P5":1.775904,"stdDev5":0.06726,"P6":1.753                                                                                                                                                             983,"stdDev6":0.121505,"P7":1.625318,"stdDev7":0.15245,"P8":1.481403,"stdDev8":0                                                                                                                                                             .198654,"P9":1.453446,"stdDev9":0.219105,"P10":1.417546,"stdDev10":0.240757,"P11                                                                                                                                                             ":1.381012,"stdDev11":0.251141,"P12":1.333675,"stdDev12":0.258311,"P13":1.300318                                                                                                                                                             ,"stdDev13":0.256255,"P14":1.267595,"stdDev14":0.247053,"P15":1.337806,"stdDev15                                                                                                                                                             ":0.222579}`))