figma.showUI(__html__, { width: 350, height: 330 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-bounding-box') {
    const { color, strokeWidth, dashPattern, addCornerRectangles, addCornerRectanglesFill } = msg;

    if (figma.currentPage.selection.length > 0) {
      const nodes = figma.currentPage.selection;

      const boundingBox = createBoundingBox(nodes, color, strokeWidth, dashPattern, addCornerRectangles, addCornerRectanglesFill);
      figma.currentPage.appendChild(boundingBox);
      figma.currentPage.selection = [boundingBox];

      figma.notify('Bounding box created');
      figma.closePlugin();
    } else {
      figma.notify('Please select at least one object');
    }

  }
};

function createBoundingBox(nodes: readonly SceneNode[], color: any, strokeWidth: number | typeof figma.mixed, dashPattern: readonly number[], addCornerRectangles: any, addCornerRectanglesFill: any) {
  const bounds = getSelectionBounds(nodes);

  const rect = figma.createRectangle();
  rect.name = "Box Rectangle";
  rect.x = 0;
  rect.y = 0;
  rect.resize(bounds.width, bounds.height);
  rect.fills = [];
  rect.strokes = [{ type: 'SOLID', color }];
  rect.strokeWeight = strokeWidth;
  rect.dashPattern = dashPattern;
  rect.strokeAlign = "CENTER";
  rect.constraints = {
    horizontal: "STRETCH",
    vertical: "STRETCH",
  };

  const frame = figma.createFrame();
  frame.name = "Bounding Box";
  frame.fills = []; // Removes the frame fill
  frame.clipsContent = false; // Disables "Clip content"
  frame.x = bounds.x;
  frame.y = bounds.y;
  frame.resize(bounds.width, bounds.height);

  frame.appendChild(rect);

  if (addCornerRectangles || addCornerRectanglesFill) {
    const cornerRects = createCornerRectangles(0, 0, bounds.width, bounds.height, color, strokeWidth, addCornerRectanglesFill);
    cornerRects[0].name = "Top Left";
    cornerRects[1].name = "Top Right";
    cornerRects[2].name = "Bottom Left";
    cornerRects[3].name = "Bottom Right";
    for (const cornerRect of cornerRects) {
      frame.appendChild(cornerRect);
    }
    cornerRects[0].constraints = { horizontal: "MIN", vertical: "MIN" };
    cornerRects[1].constraints = { horizontal: "MAX", vertical: "MIN" };
    cornerRects[2].constraints = { horizontal: "MIN", vertical: "MAX" };
    cornerRects[3].constraints = { horizontal: "MAX", vertical: "MAX" };
  }
  return frame;
}

function getSelectionBounds(nodes: any[] | readonly SceneNode[]) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  nodes.forEach((node) => {
    const bounds = node.absoluteRenderBounds;

    xMin = Math.min(xMin, bounds.x);
    yMin = Math.min(yMin, bounds.y);
    xMax = Math.max(xMax, bounds.x + bounds.width);
    yMax = Math.max(yMax, bounds.y + bounds.height);
  });

  return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
}

function createCornerRectangles(xMin: number, yMin: number, xMax: number, yMax: number, color: any, strokeWidth: number | typeof figma.mixed, addCornerRectanglesFill: any) {
  const cornerSize = Number(strokeWidth) * 3;
  const cornerStrokeSize = Number(strokeWidth);
  const cornerRects = [];

  // Top-left
  const topLeft = figma.createRectangle();
  topLeft.resize(cornerSize, cornerSize);
  if (addCornerRectanglesFill) {
    topLeft.fills = [{ type: 'SOLID', color }];
  }
  else {
    topLeft.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    topLeft.strokes = [{ type: 'SOLID', color }];
    topLeft.strokeWeight = cornerStrokeSize;
  }

  topLeft.x = xMin - cornerSize / 2;
  topLeft.y = yMin - cornerSize / 2;
  cornerRects.push(topLeft);

  // Top-right
  const topRight = figma.createRectangle();
  topRight.resize(cornerSize, cornerSize);
  if (addCornerRectanglesFill) {
    topRight.fills = [{ type: 'SOLID', color }];
  }
  else {
    topRight.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    topRight.strokes = [{ type: 'SOLID', color }];
    topRight.strokeWeight = cornerStrokeSize;
  }
  topRight.x = xMax - cornerSize + cornerSize / 2;
  topRight.y = yMin - cornerSize / 2;
  cornerRects.push(topRight);

  // Bottom-left
  const bottomLeft = figma.createRectangle();
  bottomLeft.resize(cornerSize, cornerSize);
  if (addCornerRectanglesFill) {
    bottomLeft.fills = [{ type: 'SOLID', color }];
  }
  else {
    bottomLeft.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    bottomLeft.strokes = [{ type: 'SOLID', color }];
    bottomLeft.strokeWeight = cornerStrokeSize;
  }
  bottomLeft.x = xMin - cornerSize / 2;
  bottomLeft.y = yMax - cornerSize + cornerSize / 2;
  cornerRects.push(bottomLeft);

  // Bottom-right
  const bottomRight = figma.createRectangle();
  bottomRight.resize(cornerSize, cornerSize);
  if (addCornerRectanglesFill) {
    bottomRight.fills = [{ type: 'SOLID', color }];
  }
  else {
    bottomRight.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    bottomRight.strokes = [{ type: 'SOLID', color }];
    bottomRight.strokeWeight = cornerStrokeSize;
  }
  bottomRight.x = xMax - cornerSize + cornerSize / 2;
  bottomRight.y = yMax - cornerSize + cornerSize / 2;
  cornerRects.push(bottomRight);

  return cornerRects;
}
