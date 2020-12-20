declare module "*.atlas" {
  let content: {
    [key: string]: {
      bounds: { x: number, y: number, w: number, h: number },
      pivot?: { x: number, y: number }
    }
  };

  export default content;
}

declare module "*.png" {
  let url: string;
  export default url;
}
