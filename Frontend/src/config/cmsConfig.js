import {
  HomeHero, HomeIntro, HomeProduce,
  ExploreSlide, ExploreGrid,
  StaticTextOnly
} from '../components/admin/cms/blocks';

export const PAGE_CONFIGS = {
  home: {
    mode: 'FLEXIBLE',
    allowedBlocks: {
      'home_hero': HomeHero,
      'home_intro': HomeIntro,
      'home_produce': HomeProduce
    }
  },
  explore: {
    mode: 'FLEXIBLE',
    allowedBlocks: {
      'explore_slide': ExploreSlide,
      'explore_grid': ExploreGrid
    }
  },
  terms: {
    mode: 'STATIC',
    allowedBlocks: {
      'static_content': StaticTextOnly
    }
  },
  about: {
    mode: 'STATIC',
    allowedBlocks: {
      'static_content': StaticTextOnly
    }
  }
};