import React from 'react';
import { motion } from 'framer-motion';
import LocationPicker from './LocationPicker';

const MotionDiv = motion.div;

const OrganizerCreateEventDetails = ({ variants, formData, onLocationChange, onChange }) => (
  <MotionDiv
    className="rounded-[22px] border border-white/10 bg-[#0c121d]/95 p-6 shadow-[0_18px_50px_rgba(6,11,19,0.55)] sm:p-8"
    variants={variants}
  >
    <div className="space-y-6">
      <LocationPicker
        value={formData.location}
        coordinates={
          typeof formData.locationLatitude === 'number' && typeof formData.locationLongitude === 'number'
            ? { lat: formData.locationLatitude, lng: formData.locationLongitude }
            : null
        }
        onChange={onLocationChange}
      />

      <div>
        <label htmlFor="description" className="text-sm font-medium text-white/80">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={formData.description}
          onChange={onChange}
          placeholder="Tell attendees what to expect"
          className="mt-3 w-full rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 text-base text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        />
      </div>
    </div>
    </MotionDiv>
);

export default OrganizerCreateEventDetails;
