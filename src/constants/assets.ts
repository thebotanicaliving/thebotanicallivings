export const Assets = {
  logos: {
    icon: 'https://lh3.googleusercontent.com/d/1PCe61WYkM1LeP6Elr490LhVJYzplNTGL',
    wordmark: 'https://lh3.googleusercontent.com/d/1X1HGGW4bk1UZ__dENCEd89M5ODqddlBZ',
    iconDrive: 'https://drive.google.com/file/d/1PCe61WYkM1LeP6Elr490LhVJYzplNTGL/view?usp=sharing',
    wordmarkDrive: 'https://drive.google.com/file/d/1X1HGGW4bk1UZ__dENCEd89M5ODqddlBZ/view?usp=sharing',
  },
  
  hero: {
    video: 'https://www.pexels.com/download/video/27807339/', // premium requested aesthetic video
    poster: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1920&auto=format&fit=crop',
    mobile: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1080&auto=format&fit=crop',
  },
  
  about: {
    story: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop', // beautiful botanical-inspired clean lounge/room interior
  },
  
  rooms: {
    singleSharing: {
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop', // study table, clean wood floor, elegant single room
    },
    twoSharing: {
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop', // beautiful premium twin bed configuration
    }
  },
  
  dining: {
    meals: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', // clean, premium home-style meal display
    cafe: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=1200&auto=format&fit=crop', // stunning modern rooftop cafe / terrace café space
    lounge: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop', // third premium botanical lounge image for rotation
  },
  
  lifestyle: {
    professionals: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop', // elegant, quiet focus space for professionals
    students: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop', // elegant, peaceful study space
  },
  
  gallery: [
    { type: 'image', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop', title: 'Elegant Living Lounge' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop', title: 'Premium Bathrooms' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=1000&auto=format&fit=crop', title: 'Rooftop Terrace Cafe' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop', title: 'Private Student Suite' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000&auto=format&fit=crop', title: 'Botanical Courtyard' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop', title: 'Cosy Dual Sharing Beds' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1000&auto=format&fit=crop', title: 'Greenhouse Gardens' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop', title: 'Bespoke Modern Kitchen' }
  ],
} as const;
