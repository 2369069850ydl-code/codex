import {Config} from '@remotion/cli/config';

// Low-resource defaults for a 1-core / 1 GB VPS.
Config.setConcurrency(1);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
