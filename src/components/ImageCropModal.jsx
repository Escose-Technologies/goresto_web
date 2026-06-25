import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { Icon } from '@iconify/react';

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0, flipH = false, flipV = false) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bW = image.width * cos + image.height * sin;
  const bH = image.width * sin + image.height * cos;

  canvas.width = bW;
  canvas.height = bH;
  ctx.translate(bW / 2, bH / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export const ImageCropModal = ({ open, imageSrc, onConfirm, onCancel, aspect = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flipH, flipV);
      onConfirm(blob);
    } catch {
      onCancel();
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth sx={{ zIndex: 1400 }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" fontWeight={600}>Adjust Image</Typography>
        <IconButton size="small" onClick={onCancel}><Icon icon="material-symbols:close-rounded" width={20} /></IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: 'relative', width: '100%', height: 320, bgcolor: '#111' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            transform={[
              `translate(${crop.x}px, ${crop.y}px)`,
              `rotateZ(${rotation}deg)`,
              `rotateY(${flipH ? 180 : 0}deg)`,
              `rotateX(${flipV ? 180 : 0}deg)`,
              `scale(${zoom})`,
            ].join(' ')}
          />
        </Box>

        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
            <Icon icon="mdi:magnify-plus-outline" width={20} />
            <Slider value={zoom} min={1} max={3} step={0.05} onChange={(_, v) => setZoom(v)} size="small" />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
            <Icon icon="mdi:rotate-left" width={20} />
            <Slider value={rotation} min={-180} max={180} step={1} onChange={(_, v) => setRotation(v)} size="small" />
            <Typography variant="caption" sx={{ minWidth: 32, textAlign: 'right' }}>{rotation}°</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant={flipH ? 'contained' : 'outlined'} onClick={() => setFlipH(!flipH)} startIcon={<Icon icon="mdi:flip-horizontal" width={18} />}>
              Flip H
            </Button>
            <Button size="small" variant={flipV ? 'contained' : 'outlined'} onClick={() => setFlipV(!flipV)} startIcon={<Icon icon="mdi:flip-vertical" width={18} />}>
              Flip V
            </Button>
            <Button size="small" variant="text" onClick={handleReset} startIcon={<Icon icon="mdi:refresh" width={18} />}>
              Reset
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined" size="small">Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" size="small" disabled={processing}>
          {processing ? 'Processing...' : 'Crop & Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
