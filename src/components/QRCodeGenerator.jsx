import { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from './ui/Toast';
import './QRCodeGenerator.css';

// Function to get the appropriate base URL
const getBaseUrl = () => {
  const { hostname, port, protocol } = window.location;
  
  // Check if running on localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Try to get network IP from various sources
    const networkIP = getNetworkIP();
    if (networkIP) {
      return `${protocol}//${networkIP}${port ? `:${port}` : ''}`;
    }
    // If no network IP found, keep using localhost (will show warning)
    console.warn('QR Code is using localhost. Other devices may not be able to access it. Set network IP via localStorage.setItem("goresto_network_ip", "YOUR_IP")');
  }
  
  // Use original origin for non-localhost
  return window.location.origin;
};

// Function to get network IP address
const getNetworkIP = () => {
  // Method 1: Check if Vite exposes it via import.meta.env (set in vite.config.js)
  if (import.meta.env?.VITE_NETWORK_IP) {
    return import.meta.env.VITE_NETWORK_IP;
  }
  
  // Method 2: Check localStorage for manually set IP
  const storedIP = localStorage.getItem('goresto_network_ip');
  if (storedIP) {
    return storedIP;
  }
  
  // Method 3: Try to detect from current URL if it's already a network IP
  const currentHost = window.location.hostname;
  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    // If hostname looks like an IP (has dots), use it
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(currentHost)) {
      return currentHost;
    }
  }
  
  // Return null if we can't determine network IP
  return null;
};

export const QRCodeGenerator = ({ restaurantId, restaurantName = '', tableNumber = null, showDownload = true }) => {
  const toast = useToast();
  const qrRef = useRef(null);
  const [baseUrl, setBaseUrl] = useState(() => getBaseUrl());
  
  // Generate URL with table parameter if tableNumber is provided
  const menuUrl = tableNumber ? `${baseUrl}/menu/${restaurantId}?table=${tableNumber}` : `${baseUrl}/menu/${restaurantId}`;
  const displayLabel = tableNumber ? `Table ${tableNumber} QR Code` : 'Menu QR Code';
  
  // Update base URL if network IP changes or is set
  useEffect(() => {
    const checkNetworkIP = () => {
      const newBaseUrl = getBaseUrl();
      if (newBaseUrl !== baseUrl) {
        setBaseUrl(newBaseUrl);
      }
    };
    
    // Check periodically for network IP updates (useful during development)
    const interval = setInterval(checkNetworkIP, 2000);
    
    return () => clearInterval(interval);
  }, [baseUrl]);

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    try {
      // Convert SVG to canvas then to image with text labels
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size: QR code (300x300) + padding + text area + branding
      const qrSize = 300;
      const padding = 40;
      const topTextHeight = 50; // Space for restaurant name at top
      const bottomTextHeight = 80; // Space for table number and branding
      const brandingHeight = 40; // Space for branding
      canvas.width = qrSize + (padding * 2);
      canvas.height = qrSize + (padding * 2) + topTextHeight + bottomTextHeight;
      
      img.onload = () => {
        try {
          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw restaurant name at the top
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 24px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          const restaurantText = restaurantName || 'Restaurant Menu';
          const restaurantY = padding;
          ctx.fillText(restaurantText, canvas.width / 2, restaurantY);
          
          // Draw QR code below restaurant name
          const qrX = padding;
          const qrY = padding + topTextHeight;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
          
          // Draw table number if available (below QR code)
          let brandingY = qrY + qrSize + 20;
          if (tableNumber) {
            ctx.fillStyle = '#3385F0';
            ctx.font = 'bold 20px Arial, sans-serif';
            const tableText = `Table ${tableNumber}`;
            ctx.fillText(tableText, canvas.width / 2, brandingY);
            brandingY += 35;
          }
          
          // Draw border around QR code
          ctx.strokeStyle = '#E5E7EB';
          ctx.lineWidth = 2;
          ctx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
          
          // Draw branding "Powered by GoResto"
          ctx.textBaseline = 'top';
          
          // Measure "Powered by" with smaller font
          ctx.font = '14px Arial, sans-serif';
          const poweredByText = 'Powered by';
          const poweredByWidth = ctx.measureText(poweredByText).width;
          
          // Measure "GoResto" with larger font
          ctx.font = 'bold 22px Arial, sans-serif';
          const gorestoText = 'GoResto';
          const gorestoWidth = ctx.measureText(gorestoText).width;
          
          // Calculate total width and starting position for centered text
          const spacing = 8; // Space between "Powered by" and "GoResto"
          const totalWidth = poweredByWidth + spacing + gorestoWidth;
          const startX = (canvas.width - totalWidth) / 2;
          
          // Draw "Powered by" (smaller font, gray)
          ctx.fillStyle = '#9CA3AF';
          ctx.font = '14px Arial, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(poweredByText, startX, brandingY);
          
          // Draw "GoResto" (larger font, purple)
          ctx.fillStyle = '#3385F0';
          ctx.font = 'bold 22px Arial, sans-serif';
          ctx.fillText(gorestoText, startX + poweredByWidth + spacing, brandingY);
          
          // Download as PNG
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          const fileName = tableNumber 
            ? `goresto-${restaurantName.replace(/\s+/g, '-').toLowerCase()}-table-${tableNumber}-qr.png`
            : `goresto-${restaurantName.replace(/\s+/g, '-').toLowerCase()}-menu-qr.png`;
          
          downloadLink.download = fileName;
          downloadLink.href = pngFile;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (error) {
          console.error('Error creating download:', error);
          toast.error('Error downloading QR code. Please try again.');
        }
      };
      
      img.onerror = () => {
        // Fallback: download SVG directly
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        const fileName = tableNumber 
          ? `goresto-table-${tableNumber}-qr.svg`
          : `goresto-menu-qr.svg`;
        
        downloadLink.download = fileName;
        downloadLink.href = url;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      };
      
      // Add namespace if missing
      if (!svgData.includes('xmlns')) {
        const svgWithNS = svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgWithNS);
      } else {
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Error downloading QR code. Please try again.');
    }
  };

  return (
    <div className="qr-generator-container" ref={qrRef}>
      <div className="qr-code-wrapper">
        <QRCodeSVG
          value={menuUrl}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <div className="qr-info">
        <p className="qr-label">{displayLabel}</p>
        <p className="qr-url">{menuUrl}</p>
      </div>
      {showDownload && (
        <button
          onClick={handleDownload}
          className="qr-download-btn"
          style={{ background: 'linear-gradient(180deg, #589BF3 0%, #3385F0 100%)' }}
        >
          Download QR Code
        </button>
      )}
    </div>
  );
};

