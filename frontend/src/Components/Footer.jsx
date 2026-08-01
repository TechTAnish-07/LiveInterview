import React from "react";
import { Terminal } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#070235] text-[#8683ba] border-t border-[#1e1b4b] py-8 px-6 text-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#2170e4] text-white flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-tight">LiveInterview Platform</span>
          <span className="text-[10px] font-mono text-[#89f5e7] bg-[#002723] px-2 py-0.5 rounded">
            Engineering Precision Suite
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span>© 2026 LiveInterview, Inc. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
