interface Device {
  name: string;
  price: number;
  interface: string;
  key_features: string;
  driver: string;
  compatibility: string;
}

interface Category {
  category: string;
  devices: Device[];
}


figma.showUI(__html__, { width: 360, height: 220 });


figma.ui.onmessage = async (msg: { type: string; data?: Category[] }) => {
  if (msg.type === 'generate' && msg.data) {
    try {
      await generatePresentation(msg.data);
      figma.notify('Презентация создана!', { timeout: 5000 });
    } catch (err) {
      figma.notify('Ошибка: ' + (err as Error).message, { error: true, timeout: 8000 });
    }
    figma.closePlugin();
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};


async function createCategoryTitle(parent: FrameNode, text: string, y: number) {
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  const title = figma.createText();
  title.x = 60;
  title.y = y;
  title.fontSize = 56;
  title.fontName = { family: "Inter", style: "Bold" };
  title.characters = text;
  title.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  parent.appendChild(title);
}


async function createComparisonTable(parent: FrameNode, devices: Device[], startY: number) {
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const headers = ["Модель", "Цена (₽)", "Интерфейс", "Ключевые особенности", "ПО", "Совместимость"];
  const cellWidth = 295;
  const cellHeight = 220;
  const startX = 60;

  // Заголовки
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const rect = figma.createRectangle();
    rect.x = startX + i * cellWidth;
    rect.y = startY;
    rect.resize(cellWidth, cellHeight);
    rect.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.4, b: 0.85 } }];
    rect.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    rect.strokeWeight = 2;
    parent.appendChild(rect);

    const text = figma.createText();
    text.fontName = { family: "Inter", style: "Bold" };
    text.fontSize = 28;
    text.characters = header;
    text.x = rect.x + 20;
    text.y = rect.y + 60;
    text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    text.resize(cellWidth - 40, cellHeight - 40);
    text.textAlignVertical = "CENTER";
    parent.appendChild(text);
  }


  for (let row = 0; row < devices.length; row++) {
    const dev = devices[row];
    const rowData = [
      dev.name,
      `${dev.price.toLocaleString('ru-RU')} ₽`,
      dev.interface,
      dev.key_features,
      dev.driver,
      dev.compatibility
    ];

    for (let col = 0; col < rowData.length; col++) {
      const val = rowData[col];

      const rect = figma.createRectangle();
      rect.x = startX + col * cellWidth;
      rect.y = startY + (row + 1) * cellHeight;
      rect.resize(cellWidth, cellHeight);
      rect.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.96 } }];
      rect.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.82, b: 0.82 } }];
      rect.strokeWeight = 1;
      parent.appendChild(rect);

      const text = figma.createText();

      text.fontName = { family: "Inter", style: "Regular" };
      const wordCount = val.trim().split(/\s+/).filter(w => w.length > 0).length;
      text.fontSize = wordCount <= 3 ? 36 : 24;
      text.characters = val;

      text.x = rect.x + 20;
      text.y = rect.y + 20;
      text.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.12, b: 0.12 } }];
      text.resize(cellWidth - 40, cellHeight - 60);
      text.textAlignVertical = "TOP";

      parent.appendChild(text);
    }
  }
}


async function generatePresentation(categories: Category[]) {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);

  const slideWidth = 1920;
  const slideHeight = 1080;
  const spacing = 120;
  let currentX = 0;


  const titleSlide = figma.createFrame();
  titleSlide.name = "Титульный слайд";
  titleSlide.resize(slideWidth, slideHeight);
  titleSlide.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.14 } }];

  const mainTitle = figma.createText();
  mainTitle.x = 400;
  mainTitle.y = 380;
  mainTitle.fontSize = 80;
  mainTitle.fontName = { family: "Inter", style: "Bold" };
  mainTitle.characters = "Конфигуратор стримера";
  mainTitle.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  titleSlide.appendChild(mainTitle);

  const subTitle = figma.createText();
  subTitle.x = 520;
  subTitle.y = 500;
  subTitle.fontSize = 36;
  subTitle.fontName = { family: "Inter", style: "Regular" };
  subTitle.characters = "Сравнение периферии для стриминга";
  subTitle.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.9 } }];
  titleSlide.appendChild(subTitle);

  figma.currentPage.appendChild(titleSlide);
  currentX += slideWidth + spacing;


  for (const cat of categories) {
    const slide = figma.createFrame();
    slide.name = cat.category;
    slide.resize(slideWidth, slideHeight);
    slide.x = currentX;
    slide.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];

    await createCategoryTitle(slide, cat.category, 50);
    await createComparisonTable(slide, cat.devices, 160);

    figma.currentPage.appendChild(slide);
    currentX += slideWidth + spacing;
  }


  const finalSlide = figma.createFrame();
  finalSlide.name = "Рекомендуемая сборка";
  finalSlide.resize(slideWidth, slideHeight);
  finalSlide.x = currentX;
  finalSlide.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.98, b: 0.94 } }];

  await createCategoryTitle(finalSlide, "Рекомендуемая сборка", 50);

  let y = 160;
  let total = 0;
  const drivers = new Set<string>();

  for (const cat of categories) {
    if (cat.devices.length === 0) continue;

    const chosen = cat.devices[0];
    total += chosen.price;
    drivers.add(chosen.driver);

    const line = `• ${cat.category} — ${chosen.name} (${chosen.price.toLocaleString('ru-RU')} ₽)`;

    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Regular" };
    t.fontSize = 32;
    t.characters = line;
    t.x = 140;
    t.y = y;
    t.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
    finalSlide.appendChild(t);
    y += 55;
  }

  y += 40;

  const sumText = figma.createText();
  sumText.x = 140;
  sumText.y = y;
  sumText.fontSize = 40;
  sumText.fontName = { family: "Inter", style: "Bold" };
  sumText.characters = `Итого: ${total.toLocaleString('ru-RU')} ₽`;
  sumText.fills = [{ type: 'SOLID', color: { r: 0.05, g: 0.55, b: 0.05 } }];
  finalSlide.appendChild(sumText);
  y += 70;

  const poTitle = figma.createText();
  poTitle.x = 140;
  poTitle.y = y;
  poTitle.fontSize = 28;
  poTitle.fontName = { family: "Inter", style: "Bold" };
  poTitle.characters = "Необходимое ПО:";
  finalSlide.appendChild(poTitle);
  y += 50;

  for (const d of drivers) {
    const t = figma.createText();
    t.x = 170;
    t.y = y;
    t.fontSize = 24;
    t.fontName = { family: "Inter", style: "Regular" };
    t.characters = `• ${d}`;
    finalSlide.appendChild(t);
    y += 40;
  }

  y += 30;

  const compat = figma.createText();
  compat.x = 140;
  compat.y = y;
  compat.fontSize = 22;
  compat.fontName = { family: "Inter", style: "Regular" };
  compat.characters = "Все устройства — USB, Plug & Play\nФирменное ПО требуется только для расширенных настроек";
  compat.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.35 } }];
  compat.resize(1600, 100);
  finalSlide.appendChild(compat);

  figma.currentPage.appendChild(finalSlide);

  figma.viewport.scrollAndZoomIntoView([titleSlide]);
}