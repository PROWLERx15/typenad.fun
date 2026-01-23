import React, { useRef, useState, useCallback } from 'react';
import { mergeStyles } from '../../styles/theme';
import { rankCardStyles } from './ShareableRankCard.styles';

interface ShareableRankCardProps {
  score: number;
  wpm: number;
  chainId: string;
  rankTitle: string;
  displayName?: string | null;
}

const ShareableRankCard: React.FC<ShareableRankCardProps> = ({
  score,
  wpm,
  chainId,
  rankTitle,
  displayName,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const maxRotation = 15;
    const rotateY = (mouseX / (rect.width / 2)) * maxRotation;
    const rotateX = -(mouseY / (rect.height / 2)) * maxRotation;

    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const trimCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    let bound = { top: 0, left: 0, right: canvas.width, bottom: canvas.height };

    // Find top bound
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          bound.top = y;
          y = canvas.height;
          break;
        }
      }
    }

    // Find bottom bound
    for (let y = canvas.height - 1; y >= bound.top; y--) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          bound.bottom = y + 1;
          y = -1;
          break;
        }
      }
    }

    // Find left bound
    for (let x = 0; x < canvas.width; x++) {
      for (let y = bound.top; y < bound.bottom; y++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          bound.left = x;
          x = canvas.width;
          break;
        }
      }
    }

    // Find right bound
    for (let x = canvas.width - 1; x >= bound.left; x--) {
      for (let y = bound.top; y < bound.bottom; y++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          bound.right = x + 1;
          x = -1;
          break;
        }
      }
    }

    const trimmedWidth = bound.right - bound.left;
    const trimmedHeight = bound.bottom - bound.top;

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;
    const trimmedCtx = trimmedCanvas.getContext('2d');

    if (trimmedCtx) {
      trimmedCtx.drawImage(
        canvas,
        bound.left,
        bound.top,
        trimmedWidth,
        trimmedHeight,
        0,
        0,
        trimmedWidth,
        trimmedHeight
      );
    }

    return trimmedCanvas;
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;

    try {
      // Temporarily remove shadows for clean capture
      const originalBoxShadow = cardRef.current.style.boxShadow;
      cardRef.current.style.boxShadow = 'none';

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: 'transparent',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Restore original shadow
      cardRef.current.style.boxShadow = originalBoxShadow;

      // Trim white borders
      const trimmedCanvas = trimCanvas(canvas);

      trimmedCanvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
      });
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Temporarily remove shadows for clean capture
      const originalBoxShadow = cardRef.current.style.boxShadow;
      cardRef.current.style.boxShadow = 'none';

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: 'transparent',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Restore original shadow
      cardRef.current.style.boxShadow = originalBoxShadow;

      // Trim white borders
      const trimmedCanvas = trimCanvas(canvas);

      const link = document.createElement('a');
      link.download = `typemonad-rank-${score}.png`;
      link.href = trimmedCanvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const handleShareX = async () => {
    if (!cardRef.current) return;

    try {
      // Temporarily remove shadows for clean capture
      const originalBoxShadow = cardRef.current.style.boxShadow;
      cardRef.current.style.boxShadow = 'none';

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: 'transparent',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Restore original shadow
      cardRef.current.style.boxShadow = originalBoxShadow;

      // Trim white borders
      const trimmedCanvas = trimCanvas(canvas);

      trimmedCanvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        }
      });

      const tweetText = `I'm a ${rankTitle} on TypeMonad!\n\nScore: ${score.toLocaleString()}\nWPM: ${wpm || '-'}\n\nPlay now: https://typemonad.xyz\n\n#TypeMonad #TypingGame #Web3Gaming`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

      window.open(tweetUrl, '_blank', 'width=550,height=420');

      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const shortChainId = `${chainId.substring(0, 8)}...${chainId.substring(chainId.length - 6)}`;

  return (
    <div style={rankCardStyles.wrapper}>
      <div
        ref={cardRef}
        style={mergeStyles(
          rankCardStyles.card,
          isHovered ? rankCardStyles.cardHovered : {},
          {
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Inner glow effect */}
        <div style={rankCardStyles.innerGlow} />

        {/* Corner decorations */}
        <div style={mergeStyles(rankCardStyles.cornerDecor, rankCardStyles.cornerTopLeft)} />
        <div style={mergeStyles(rankCardStyles.cornerDecor, rankCardStyles.cornerTopRight)} />
        <div style={mergeStyles(rankCardStyles.cornerDecor, rankCardStyles.cornerBottomLeft)} />
        <div style={mergeStyles(rankCardStyles.cornerDecor, rankCardStyles.cornerBottomRight)} />

        {/* Header */}
        <div style={rankCardStyles.header}>
          <img src="/images/typemonad.png" alt="TypeMonad" style={rankCardStyles.logo} />
          <span style={rankCardStyles.gameTitle}>TYPEMONAD</span>
        </div>

        {/* Rank Badge */}
        <div style={rankCardStyles.rankBadge}>
          {rankTitle}
        </div>

        {/* Stats Grid */}
        <div style={rankCardStyles.statsGrid}>
          <div style={rankCardStyles.statBox}>
            <div style={rankCardStyles.statLabel}>High Score</div>
            <div style={rankCardStyles.statValue}>{score.toLocaleString()}</div>
          </div>
          <div style={rankCardStyles.statBox}>
            <div style={rankCardStyles.statLabel}>Best WPM</div>
            <div style={rankCardStyles.statValue}>{wpm || '-'}</div>
          </div>
        </div>

        {/* Player Name / Chain ID */}
        <div style={displayName ? rankCardStyles.displayName : rankCardStyles.chainId}>
          {displayName || shortChainId}
        </div>

        {/* Footer */}
        <div style={rankCardStyles.footer}>
          <span style={rankCardStyles.footerText}>TypeMonad</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={rankCardStyles.actionsContainer}>
        <button
          onClick={handleCopy}
          style={mergeStyles(
            rankCardStyles.actionButton,
            copySuccess ? rankCardStyles.actionButtonSuccess : {}
          )}
          onMouseEnter={(e) => {
            if (!copySuccess) {
              Object.assign(e.currentTarget.style, rankCardStyles.actionButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            if (!copySuccess) {
              Object.assign(e.currentTarget.style, rankCardStyles.actionButton);
            }
          }}
        >
          {copySuccess ? 'Copied!' : 'Copy Card'}
        </button>
        <button
          onClick={handleDownload}
          style={mergeStyles(
            rankCardStyles.actionButton,
            downloadSuccess ? rankCardStyles.actionButtonSuccess : {}
          )}
          onMouseEnter={(e) => {
            if (!downloadSuccess) {
              Object.assign(e.currentTarget.style, rankCardStyles.actionButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            if (!downloadSuccess) {
              Object.assign(e.currentTarget.style, rankCardStyles.actionButton);
            }
          }}
        >
          {downloadSuccess ? 'Saved!' : 'Download Card'}
        </button>
        <button
          onClick={handleShareX}
          style={mergeStyles(
            rankCardStyles.actionButton,
            shareSuccess ? rankCardStyles.actionButtonSuccess : {}
          )}
          onMouseEnter={(e) => {
            if (!shareSuccess) {
              Object.assign(e.currentTarget.style, rankCardStyles.actionButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            if (!shareSuccess) {
              Object.assign(e.currentTarget.style, rankCardStyles.actionButton);
            }
          }}
        >
          {shareSuccess ? 'Paste image!' : 'Share on X'}
        </button>
      </div>
    </div>
  );
};

export default ShareableRankCard;
