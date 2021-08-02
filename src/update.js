import {
  getNewScale
} from './core/scale'

export default function update() {
  const self = this

  if (!self.src) return

  self.__oneTouchStart = (touch) => {
    self.touchX0 = Math.round(touch.x)
    self.touchY0 = Math.round(touch.y)
    const {
      x, y, width, height
    } = self.cut;
    // 从 左上角 顺时针 到左下角 
    const fourTrigger = [
      [x, y], [x + width, y], [x + width, y + height], [x, y + height]
    ];
    const triggers = [
      "topLeft", "topRight", "bottomRight", "bottomLeft"
    ];
    const index = fourTrigger.findIndex(([x, y]) => {
      const deltaX = Math.round(Math.abs(x - touch.x));
      const deltaY = Math.round(Math.abs(y - touch.y));
      return deltaX < 10 && deltaY < 10;
    });
    self.activeCut = triggers[index];
    self.cut0 = Object.assign({}, self.cut);
  }

  self.__oneTouchMove = (touch) => {
    let xMove, yMove
    // 计算单指移动的距离
    if (self.touchended) {
      return self.updateCanvas()
    }

    xMove = Math.round(touch.x - self.touchX0)
    yMove = Math.round(touch.y - self.touchY0)

    /** 裁剪生效中 */
    if (self.activeCut) {
      const newCut = Object.assign({}, self.cut0 || {});
      switch (self.activeCut) {
        case "topLeft": {
          newCut.x += xMove;
          newCut.y += yMove;
          newCut.width -= xMove;
          newCut.height -= yMove;
          break;
        }
        case "topRight": {
          newCut.y += yMove;
          newCut.width += xMove;
          newCut.height -= yMove;
          break;
        }
        case "bottomRight": {
          newCut.width += xMove;
          newCut.height += yMove;
          break;
        }
        case "bottomLeft": {
          newCut.x += xMove;
          newCut.width -= xMove;
          newCut.height += yMove;
          break;
        }
        default: break;
      }
      self.updateCut(newCut);
    } else {
      const imgLeft = Math.round(self.rectX + xMove)
      const imgTop = Math.round(self.rectY + yMove)

      self.outsideBound(imgLeft, imgTop)

      self.updateCanvas()
    }


  }

  self.__twoTouchStart = (touch0, touch1) => {
    let xMove, yMove, oldDistance

    self.touchX1 = Math.round(self.rectX + self.scaleWidth / 2)
    self.touchY1 = Math.round(self.rectY + self.scaleHeight / 2)

    // 计算两指距离
    xMove = Math.round(touch1.x - touch0.x)
    yMove = Math.round(touch1.y - touch0.y)
    oldDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove))

    self.oldDistance = oldDistance
  }

  self.__twoTouchMove = (touch0, touch1) => {
    const { oldScale, oldDistance, scale, zoom } = self

    self.newScale = getNewScale(oldScale, oldDistance, zoom, touch0, touch1)

    //  设定缩放范围
    self.newScale <= 1 && (self.newScale = 1)
    self.newScale >= scale && (self.newScale = scale)

    self.scaleWidth = Math.round(self.newScale * self.baseWidth)
    self.scaleHeight = Math.round(self.newScale * self.baseHeight)
    const imgLeft = Math.round(self.touchX1 - self.scaleWidth / 2)
    const imgTop = Math.round(self.touchY1 - self.scaleHeight / 2)

    self.outsideBound(imgLeft, imgTop)

    self.updateCanvas()
  }

  self.__xtouchEnd = () => {
    self.oldScale = self.newScale
    self.rectX = self.imgLeft
    self.rectY = self.imgTop
    self.activeCut = undefined;
    self.cut0 = undefined;
  }
}
