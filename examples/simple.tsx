import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import ReactImgEditor, { ImageUtil } from '../src/index'
import '../assets/index.less'

function Example() {
  const stageRef = useRef<any>(null)
  const [active, setActive] = useState<boolean | null>(true)
  let closefunc = null;
  function setStage(stage) {
    stageRef.current = stage
  }

  function downloadImage() {
    const handle = () => {
      const canvas = ImageUtil.getImageCanvas({ stage: stageRef.current, zoom: { innerzoom: true } });
      canvas.toBlob(function (blob: any) {
        const link = document.createElement('a')
        link.download = ''
        link.href = URL.createObjectURL(blob)
        link.click()
        link.remove();
      }, 'image/jpeg')
    };
    if (closefunc) {
      closefunc();
      setTimeout(handle, 100);
    } else {
      handle();
    }
  }

  const image1 = 'https://cstore-public.seewo.com/faq-service/4e3f2924f1d4432f82e760468bf680f0'
  const image2 = 'https://cvte-dev-public.seewo.com/faq-service-test/4db524ec93324794b983bf7cd78b2ae1'
  // const image3 = 'https://cvte-dev-public.seewo.com/faq-service-test/bfdcc5337dfb43ce823a4c9743aba99c'
  // const image4 = 'https://cvte-dev-public.seewo.com/faq-service-test/bc87ceeb7b1a473da41e025e656af966'

  return (
    <div>
      <ReactImgEditor
        src={image1}
        plugins={[]}
        width={800}
        getStage={setStage}
        defaultPluginName=""
        stageEvents={["zoomOnWheel", "zoomOnTouch"]}
        style={{ border: "1px solid #ddd" }}
        zoom={{ innerzoom: true }}
        active={active}
        closePlugin={func => closefunc = func}
      />
      <div style={{ marginTop: '50px' }}>
        <button onClick={downloadImage}>download</button>
        <button onClick={() => setActive(!active)}>active</button>
      </div>
    </div>
  )
}

ReactDOM.render(<Example />, document.getElementById('__react-content'))