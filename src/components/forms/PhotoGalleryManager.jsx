import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { ImageCropModal } from '../ImageCropModal';
import { restaurantPhotoService, uploadService } from '../../services/apiService';
import { compressImage, MAX_PICK_BYTES } from '../../utils/compressImage';
import { useToast } from '../ui/Toast';

const MAX_PHOTOS = 10;
// The public menu shows these as the banner, which is a wide strip — crop to
// match so nothing important is chopped off on the customer's phone.
const BANNER_ASPECT = 16 / 9;

export const PhotoGalleryManager = ({ restaurantId }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [captionDrafts, setCaptionDrafts] = useState({});

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await restaurantPhotoService.getAll(restaurantId);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Could not load photos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.warning('Please select an image file'); return; }
    if (file.size > MAX_PICK_BYTES) { toast.warning('Image size should be less than 10MB'); return; }
    setRawImageSrc(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeCrop = () => {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
  };

  const handleCropConfirm = async (croppedBlob) => {
    closeCrop();
    setUploading(true);
    try {
      const compressed = await compressImage(croppedBlob, 'banner');
      const file = new File([compressed], 'photo.jpg', { type: 'image/jpeg' });
      const { url } = await uploadService.uploadImage(file);
      const created = await restaurantPhotoService.create(restaurantId, { url });
      setPhotos((prev) => [...prev, created]);
      toast.success('Photo added');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    const prev = photos;
    setPhotos(next);
    try {
      await restaurantPhotoService.reorder(restaurantId, next.map((p) => p.id));
    } catch (err) {
      setPhotos(prev);
      toast.error('Could not reorder: ' + err.message);
    }
  };

  const remove = async (photo) => {
    const prev = photos;
    setPhotos((list) => list.filter((p) => p.id !== photo.id));
    try {
      await restaurantPhotoService.remove(restaurantId, photo.id);
    } catch (err) {
      setPhotos(prev);
      toast.error('Could not remove: ' + err.message);
    }
  };

  const saveCaption = async (photo) => {
    const draft = captionDrafts[photo.id];
    if (draft === undefined || draft === (photo.caption || '')) return;
    try {
      const updated = await restaurantPhotoService.update(restaurantId, photo.id, { caption: draft });
      setPhotos((list) => list.map((p) => (p.id === photo.id ? updated : p)));
      setCaptionDrafts((d) => { const { [photo.id]: _drop, ...rest } = d; return rest; });
    } catch (err) {
      toast.error('Could not save caption: ' + err.message);
    }
  };

  const full = photos.length >= MAX_PHOTOS;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1.5}>
        <Typography variant="caption" color="text.secondary">
          {photos.length} of {MAX_PHOTOS} used · they rotate as the banner on your public menu, in this order
        </Typography>
        <Button
          size="small"
          variant="outlined"
          disabled={uploading || full}
          onClick={() => fileInputRef.current?.click()}
          startIcon={uploading ? <CircularProgress size={16} /> : <Icon icon="mdi:image-plus" width={18} />}
        >
          {uploading ? 'Uploading…' : 'Add photo'}
        </Button>
      </Stack>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePick} style={{ display: 'none' }} />

      {full && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          You have reached the {MAX_PHOTOS} photo limit — remove one to add another.
        </Typography>
      )}

      {loading ? (
        <Stack alignItems="center" py={4}><CircularProgress size={24} /></Stack>
      ) : photos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, color: 'text.secondary' }}>
          <Icon icon="mdi:image-multiple-outline" width={40} style={{ opacity: 0.4 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>No photos yet</Typography>
          <Typography variant="caption">
            Add pictures of your space, your team or your signature dishes. Customers see them the moment the menu opens.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {photos.map((photo, index) => (
            <Stack
              key={photo.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box
                component="img"
                src={photo.url}
                alt={photo.caption || `Photo ${index + 1}`}
                sx={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0, bgcolor: 'action.hover' }}
              />
              <TextField
                size="small"
                fullWidth
                placeholder="Caption (optional)"
                value={captionDrafts[photo.id] ?? (photo.caption || '')}
                onChange={(e) => setCaptionDrafts((d) => ({ ...d, [photo.id]: e.target.value.slice(0, 120) }))}
                onBlur={() => saveCaption(photo)}
              />
              <Stack direction="row" spacing={0.25} flexShrink={0}>
                <Tooltip title="Move earlier">
                  <span>
                    <IconButton size="small" disabled={index === 0} onClick={() => move(index, -1)}>
                      <Icon icon="mdi:arrow-up" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move later">
                  <span>
                    <IconButton size="small" disabled={index === photos.length - 1} onClick={() => move(index, 1)}>
                      <Icon icon="mdi:arrow-down" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Remove photo">
                  <IconButton size="small" color="error" onClick={() => remove(photo)}>
                    <Icon icon="mdi:trash-can-outline" width={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}

      <ImageCropModal
        open={Boolean(rawImageSrc)}
        imageSrc={rawImageSrc}
        aspect={BANNER_ASPECT}
        onConfirm={handleCropConfirm}
        onCancel={closeCrop}
      />
    </Box>
  );
};

export default PhotoGalleryManager;
