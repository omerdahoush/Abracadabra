import { GoogleGenAI, Modality, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function enhanceProductImage(
    imagePart: Part, 
    text: string, 
    fontStyle: string, 
    fontColor: string, 
    backgroundStyle: string, 
    fontSize: string, 
    colorPalette: string,
    specialEffect: string
): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    
    let backgroundInstruction = '';
    switch (backgroundStyle) {
        case 'Solid White':
            backgroundInstruction = 'Replace the background with a clean, solid white background (#FFFFFF).';
            break;
        case 'Solid Black':
            backgroundInstruction = 'Replace the background with a dramatic, solid black background (#000000).';
            break;
        case 'Transparent':
            backgroundInstruction = 'Replace the background, making it completely transparent (alpha channel). Ensure the output format supports transparency (like PNG).';
            break;
        case 'Wood Grain':
            backgroundInstruction = 'Replace the background with a realistic, high-quality light wood grain texture.';
            break;
        case 'Marble':
            backgroundInstruction = 'Replace the background with an elegant, white marble texture with subtle gray veining.';
            break;
        case 'Light Gradient':
        default:
            backgroundInstruction = 'Replace the background with a subtle, clean, light gray to white gradient.';
            break;
    }

    let fontSizeInstruction = '';
    switch (fontSize) {
        case 'Small':
            fontSizeInstruction = 'a relatively small font size';
            break;
        case 'Large':
            fontSizeInstruction = 'a large, prominent font size';
            break;
        case 'Extra Large':
            fontSizeInstruction = 'an extra large, attention-grabbing font size';
            break;
        case 'Medium':
        default:
            fontSizeInstruction = 'a standard, medium font size';
            break;
    }

    let colorPaletteInstruction = '';
    switch (colorPalette) {
        case 'Vibrant & Bold':
            colorPaletteInstruction = 'Adjust the overall color grading of the image to be vibrant and bold, with high contrast and saturated colors.';
            break;
        case 'Pastel & Soft':
            colorPaletteInstruction = 'Adjust the overall color grading of the image to a soft, pastel color palette with gentle tones and low contrast.';
            break;
        case 'Monochromatic Blues':
            colorPaletteInstruction = 'Apply a monochromatic color grading using shades of blue, creating a cool and cohesive look.';
            break;
        case 'Earthy Tones':
            colorPaletteInstruction = 'Adjust the overall color grading to use warm, earthy tones like terracotta, olive green, and beige.';
            break;
        case 'Cool & Professional':
             colorPaletteInstruction = "Apply a cool color grading with an emphasis on blues and whites for a clean, professional, and corporate feel.";
            break;
        case 'Default':
        default:
            colorPaletteInstruction = '';
            break;
    }

    let specialEffectInstruction = '';
    switch (specialEffect) {
        case 'Water Splash':
            specialEffectInstruction = 'Artistically add a dynamic splash of clean water around the product to give it a fresh, energetic feel. The splashes should look realistic and not obscure the product itself.';
            break;
        case 'Smoke':
            specialEffectInstruction = 'Incorporate subtle, elegant wisps of white smoke around the product to create a sense of mystery and sophistication. The smoke should enhance the product, not hide it.';
            break;
        case 'Glitter':
            specialEffectInstruction = 'Add a shower of elegant, fine glitter around the product. The glitter should appear realistic and magical, subtly catching the light without overwhelming the product.';
            break;
        case 'Bokeh':
            specialEffectInstruction = 'Create a beautiful bokeh effect in the background, with soft, out-of-focus light circles. This should give the image a dreamy and high-end photographic feel, making the product stand out.';
            break;
        case 'Neon Glow':
            specialEffectInstruction = 'Add a subtle neon glow effect that outlines the product. The glow should be a vibrant color that complements the product, giving it a futuristic and edgy look.';
            break;
        case 'Vintage Film':
            specialEffectInstruction = 'Apply a vintage film grain and a slightly faded, nostalgic color grading to the entire image. This should give the photo a classic, retro aesthetic, like a shot from an old movie.';
            break;
    }
    
    const instructions = [
      'Isolate the main product and completely remove the original background.',
      backgroundInstruction,
      'Adjust the lighting on the product to be bright and professional, as if shot in a studio, eliminating harsh shadows and adding soft highlights.',
    ];

    if (specialEffectInstruction) {
      instructions.push(specialEffectInstruction);
    }

    if (colorPaletteInstruction) {
      instructions.push(colorPaletteInstruction);
    }

    instructions.push("Enhance the product's colors and sharpness for a crisp, appealing look.");

    if (text) {
      instructions.push(`Add the text "${text}". Use the font style "${fontStyle}", the color "${fontColor}", and ${fontSizeInstruction}. Position the text tastefully in a lower corner, ensuring it doesn't obstruct the product.`);
    }

    const numberedInstructions = instructions.map((inst, index) => `${index + 1}. ${inst}`).join('\n');


    const textPrompt = `Please transform this product photo into a professional e-commerce image. Perform the following actions:
${numberedInstructions}
The final output must be only the image.`;

    const contents = {
        parts: [
            imagePart,
            { text: textPrompt },
        ],
    };

    const response = await ai.models.generateContent({
        model: model,
        contents,
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];

    if (firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }
    
    throw new Error("No image data received from the API.");
}