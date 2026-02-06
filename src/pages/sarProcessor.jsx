/**
 * Processes the raw SAR report string, extracts content for Part A, B, and C,
 * and formats it for structured React display, parsing key-value pairs.
 * @param {string} sarContent - The raw string content from activeReport.sarReport.
 * @returns {Array<{heading: string, data: Array<{key: string, value: string}>}>} - Structured data for display.
 */
// export const processSarReport = (sarContent) => {
//     // 1. Define the custom headings mapping
//     const customHeadings = {
//         'PART A': 'Profile details of the account holder related to flagged transactions :',
//         'PART B': 'Description of the suspicious activity :',
//         'PART C': 'Action taken :',
//     };

//     // 2. Clean up the content to remove the outer <pre> tags and any potential inner formatting
//     let cleanContent = sarContent.replace(/<pre>|<\/pre>/g, '').trim();

//     // 3. Define the section dividers
//     // Split by major headings (PART A, PART B, PART C, including the rest of the line)
//     const sections = cleanContent.split(/^(PART [A-C]: [^\n]+)$/m).filter(s => s.trim().length > 0);

//     const reportData = [];
//     let currentOriginalHeading = null;
//     let currentPartKey = null; // Will hold 'PART A', 'PART B', or 'PART C'

//     // 4. Iterate and structure the data
//     for (const section of sections) {
//         if (section.startsWith("PART ")) {
//             // This is a heading line (e.g., "PART A: PARTICULARS...")
//             currentOriginalHeading = section.trim();

//             // Extract the 'PART A', 'PART B', or 'PART C' identifier
//             const matchPart = currentOriginalHeading.match(/^(PART [A-C])/);
//             if (matchPart) {
//                 currentPartKey = matchPart[1];
//             } else {
//                 currentPartKey = null; // Should not happen with the current regex
//             }

//         } else if (currentOriginalHeading && currentPartKey) {
//             // This is the content for the previously found heading
//             let rawContent = section.trim().replace(/^-{50,}/gm, '').trim();
            
//             // --- Logic: Parse the key-value pairs from the content string ---
//             const data = [];
//             // Regex to match lines in the format: Key : Value
//             const lines = rawContent.split('\n');

//             for (const line of lines) {
//                 // Look for the first colon that separates the key and value
//                 const match = line.match(/^([^:]+?)\s*:\s*(.*)$/);
                
//                 if (match) {
//                     const key = match[1].trim();
//                     const value = match[2].trim();
                    
//                     if (key) { // Ensure key is not empty
//                         data.push({
//                             key: key,
//                             value: value,
//                         });
//                     }
//                 } else if (line.trim().length > 0) {
//                     // Handle non-key-value lines as a single content line
//                     data.push({
//                         key: '',
//                         value: line.trim() 
//                     });
//                 }
//             }
//             // --- End Logic ---

//             // **MODIFICATION HERE:** Use the custom heading based on the part key.
//             const finalHeading = customHeadings[currentPartKey] || currentOriginalHeading;

//             reportData.push({
//                 heading: finalHeading, // Use the new, clean heading
//                 partKey: currentPartKey, // Keep the part key for conditional rendering
//                 data: data, // Array of {key, value} objects
//             });
//             currentOriginalHeading = null; // Reset for the next heading
//             currentPartKey = null;
//         }
//     }

//     return reportData;
// };




// export const processSarReport = (rawText) => {
//     if (!rawText || typeof rawText !== 'string') return [];

//     const sections = [];
//     // Split by the horizontal rules (---) or the Double Hash headers (##)
//     const lines = rawText.split('\n');
    
//     let currentSection = null;

//     lines.forEach(line => {
//         const trimmedLine = line.trim();
//         if (!trimmedLine) return;

//         // 1. Detect Headings (e.g., ## PART A: ...)
//         if (trimmedLine.startsWith('##')) {
//             if (currentSection) sections.push(currentSection);
            
//             currentSection = {
//                 heading: trimmedLine.replace('##', '').trim(),
//                 partKey: trimmedLine.includes('PART A') ? 'PART A' : 
//                          trimmedLine.includes('PART B') ? 'PART B' : 'PART C',
//                 data: []
//             };
//         } 
//         // 2. Detect Key-Value Pairs (Part A: "First Name : Martinez")
//         else if (currentSection && currentSection.partKey === 'PART A' && trimmedLine.includes(':')) {
//             const [key, ...valueParts] = trimmedLine.split(':');
//             currentSection.data.push({
//                 key: key.trim(),
//                 value: valueParts.join(':').trim()
//             });
//         }
//         // 3. Detect Bullet Points (Part B & C: "• Text content")
//         else if (currentSection && (trimmedLine.startsWith('•') || trimmedLine.startsWith('*'))) {
//             currentSection.data.push({
//                 key: null,
//                 value: trimmedLine.replace(/^[•*]\s*/, '').trim()
//             });
//         }
//         // 4. Fallback for non-bulleted paragraphs in B & C
//         else if (currentSection && trimmedLine !== '---' && !trimmedLine.includes('END OF REPORT')) {
//             currentSection.data.push({
//                 key: null,
//                 value: trimmedLine
//             });
//         }
//     });

//     if (currentSection) sections.push(currentSection);
//     return sections;
// };







// export const processSarReport = (rawText) => {
//     if (!rawText || typeof rawText !== 'string') return [];

//     const sections = [];
//     const lines = rawText.split('\n');
//     let currentSection = null;

//     lines.forEach(line => {
//         let trimmedLine = line.trim();
        
//         // 1. Skip empty lines, horizontal rules, and footer
//         if (!trimmedLine || trimmedLine === '---' || trimmedLine.toUpperCase().includes('END OF REPORT')) return;

//         // 2. Detect and Clean Headings (Removing # and ##)
//         if (trimmedLine.startsWith('#')) {
//             if (currentSection) sections.push(currentSection);
            
//             const headingText = trimmedLine.replace(/#/g, '').trim();
//             currentSection = {
//                 heading: headingText,
//                 partKey: headingText.includes('PART A') ? 'PART A' : 
//                          headingText.includes('PART B') ? 'PART B' : 'PART C',
//                 data: []
//             };
//             return;
//         }

//         if (!currentSection) return;

//         // 3. Process Part A: Key-Value Pairs with Bold stars **Key :** Value
//         if (currentSection.partKey === 'PART A' && trimmedLine.includes(':')) {
//             // Remove the bold asterisks from the line
//             const cleanLine = trimmedLine.replace(/\*\*/g, '');
//             const [key, ...valueParts] = cleanLine.split(':');
            
//             currentSection.data.push({
//                 key: key.trim(),
//                 value: valueParts.join(':').trim()
//             });
//         } 
//         // 4. Process Part B & C: Numbered Lists or Bullets
//         else {
//             // Remove numbered prefixes (e.g., "1. ") or bullet points
//             const cleanValue = trimmedLine.replace(/^\d+\.\s*/, '').replace(/^[•*]\s*/, '').replace(/\*\*/g, '');
            
//             if (cleanValue) {
//                 currentSection.data.push({
//                     key: null,
//                     value: cleanValue.trim()
//                 });
//             }
//         }
//     });

//     if (currentSection) sections.push(currentSection);
//     return sections;
// };









export const processSarReport = (rawText) => {
    if (!rawText || typeof rawText !== 'string') return [];

    const sections = [];
    const lines = rawText.split('\n');
    let currentSection = null;

    lines.forEach(line => {
        let trimmedLine = line.trim();
        
        // 1. Filter out UI clutter: Headers, Horizontal Rules, and Footers
        if (
            !trimmedLine || 
            trimmedLine === '---' || 
            trimmedLine.toUpperCase().includes('END OF REPORT') ||
            trimmedLine.toUpperCase() === '# SUSPICIOUS ACTIVITY REPORT (SAR)'
        ) return;

        // 2. Detect and Clean Headings (Removing # and ##)
        if (trimmedLine.startsWith('#')) {
            if (currentSection) sections.push(currentSection);
            
            // Clean the heading text completely
            const headingText = trimmedLine.replace(/[#*]/g, '').trim();
            currentSection = {
                heading: headingText,
                // Create a clean key for logic checks
                partKey: headingText.includes('PART A') ? 'PART A' : 
                         headingText.includes('PART B') ? 'PART B' : 'PART C',
                data: []
            };
            return;
        }

        if (!currentSection) return;

        // 3. Process Part A: KEY-VALUE alignment
        if (currentSection.partKey === 'PART A' && trimmedLine.includes(':')) {
            // Remove the bold stars ** from the key/value
            const cleanLine = trimmedLine.replace(/\*\*/g, '');
            const [key, ...valueParts] = cleanLine.split(':');
            
            currentSection.data.push({
                key: key.trim(),
                value: valueParts.join(':').trim()
            });
        } 
        // 4. Process Part B & C: Clean List Items
        else {
            // Remove numbered prefixes (1.), bullet points (•), and bold stars (**)
            const cleanValue = trimmedLine
                .replace(/^\d+\.\s*/, '')
                .replace(/^[•*]\s*/, '')
                .replace(/\*\*/g, '');
            
            if (cleanValue) {
                currentSection.data.push({
                    key: null,
                    value: cleanValue.trim()
                });
            }
        }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
};