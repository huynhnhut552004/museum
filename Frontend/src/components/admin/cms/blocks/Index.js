import IntroAdminBlock from './IntroAdminBlock';
import HeroAdminBlock from './HeroAdminBlock';
import ScrollAdminBlock from './ScrollAdminBlock';
import NationAdminBlock from './NationAdminBlock';
import ProduceAdminBlock from './ProduceAdminBlock';
import InteractionAdminBlock from './InteractionAdminBlock';
import PolicyAdminBlock from './PolicyAdminBlock';
import AboutIntroAdminBlock from './AboutIntroAdminBlock';
import AboutVisionAdminBlock from './AboutVisionAdminBlock';
import AboutOutroAdminBlock from './AboutOutroAdminBlock';
import ContactAdminBlock from './ContactAdminBlock';
import ExploreHeroAdminblock from './ExploreHeroAdminBlock';
import ExploreThemeAdminBlock from './ExploreThemeAdminBlock';
import ExploreStoryAdminBlock from './ExploreStoryAdminBlock';
import ExploreGridAdminBlock from './ExploreGridAdminBlock';
import ExploreVideoAdminBlock from './ExploreVideoAdminBlock';
import ExploreColorAdminBlock from './ExploreColorAdminBlock';
import ExploreZoomAdminBlock from './ExploreZoomAdminBlock';
import ExploreSlideAdminBlock from './ExploreSlideAdminBlock';
import HomeDigitalAdminBlock from './HomeDigitalAdminBlock';
import ExploreDigitalAdminBlock from './ExploreDigitalAdminBlock';

export const BlockRegistry = {
  'hero_block': HeroAdminBlock,
  'intro_block': IntroAdminBlock,
  'scroll_block': ScrollAdminBlock,
  'spiritual_block': IntroAdminBlock,
  'nation_block': NationAdminBlock,
  'produce_block': ProduceAdminBlock,
  'interaction_block': InteractionAdminBlock,
  'policy_block': PolicyAdminBlock,
  'aboutIntro_block': AboutIntroAdminBlock,
  'aboutVision_block': AboutVisionAdminBlock,
  'aboutOutro_block': AboutOutroAdminBlock,
  'contact_block': ContactAdminBlock,
  'exploreHero_block': ExploreHeroAdminblock,
  'exploreTheme_block': ExploreThemeAdminBlock,
  'exploreStory_block': ExploreStoryAdminBlock,
  'exploreTradition_block': ExploreThemeAdminBlock,
  'exploreGrid_block': ExploreGridAdminBlock,
  'explorevideo_block': ExploreVideoAdminBlock,
  'exploreColor_block': ExploreColorAdminBlock,
  'exploreZoomImage_block': ExploreZoomAdminBlock,
  'exploreSlide_block': ExploreSlideAdminBlock,
  'exploreMore_block': ExploreStoryAdminBlock,
  'section 1': HomeDigitalAdminBlock,
  'section 2': HomeDigitalAdminBlock,
  'section 3': HomeDigitalAdminBlock,
  'section 4': HomeDigitalAdminBlock,
  'section 5': HomeDigitalAdminBlock,
  'exploreDigital_block': ExploreDigitalAdminBlock
};

export const BLOCK_SETTINGS = { 'exploreTradition_block': { itemCount: 5 }, 'exploreTheme_block': { itemCount: 4 }, };