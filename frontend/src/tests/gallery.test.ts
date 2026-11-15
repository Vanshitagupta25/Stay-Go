import test from 'node:test';
import assert from 'node:assert/strict';
import { getGalleryImages } from '../utils/gallery.ts';

test('gallery images prefer the primary image and preserve uploaded order', () => {
  const images = getGalleryImages({
    image: { url: 'https://cdn.example.com/primary.jpg' },
    images: [
      { url: 'https://cdn.example.com/living.jpg' },
      { url: 'https://cdn.example.com/bedroom.jpg' },
    ],
  });

  assert.deepEqual(images, [
    'https://cdn.example.com/primary.jpg',
    'https://cdn.example.com/living.jpg',
    'https://cdn.example.com/bedroom.jpg',
  ]);
});

test('gallery images deduplicate the primary image when it is also uploaded', () => {
  const images = getGalleryImages({
    image: { url: 'https://cdn.example.com/primary.jpg' },
    images: [
      { url: 'https://cdn.example.com/primary.jpg' },
      { url: 'https://cdn.example.com/pool.jpg' },
    ],
  });

  assert.deepEqual(images, [
    'https://cdn.example.com/primary.jpg',
    'https://cdn.example.com/pool.jpg',
  ]);
});

test('gallery images ignore blank urls and cap the grid at five photos', () => {
  const images = getGalleryImages({
    image: { url: '  ' },
    images: [
      { url: 'https://cdn.example.com/1.jpg' },
      { url: '' },
      { url: 'https://cdn.example.com/2.jpg' },
      { url: 'https://cdn.example.com/3.jpg' },
      { url: 'https://cdn.example.com/4.jpg' },
      { url: 'https://cdn.example.com/5.jpg' },
      { url: 'https://cdn.example.com/6.jpg' },
    ],
  });

  assert.deepEqual(images, [
    'https://cdn.example.com/1.jpg',
    'https://cdn.example.com/2.jpg',
    'https://cdn.example.com/3.jpg',
    'https://cdn.example.com/4.jpg',
    'https://cdn.example.com/5.jpg',
  ]);
});

test('gallery images handles missing listings and missing image arrays', () => {
  assert.deepEqual(getGalleryImages(null), []);
  assert.deepEqual(getGalleryImages({}), []);
  assert.deepEqual(getGalleryImages({ images: null }), []);
});
