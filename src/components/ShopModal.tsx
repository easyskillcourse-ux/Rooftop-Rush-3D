import React from 'react';
import { CharacterSkin } from '../types';
import { X, Check, Lock, Sparkles } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface ShopModalProps {
  skins: CharacterSkin[];
  activeSkinId: string;
  totalCoins: number;
  onSelectSkin: (skin: CharacterSkin) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  skins,
  activeSkinId,
  totalCoins,
  onSelectSkin,
  onUnlockSkin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white tracking-wide">Hero Locker & Skins</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Coin balance */}
            <div className="bg-slate-800 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-slate-700">
              <span className="text-xs font-black text-amber-400">★</span>
              <span className="text-sm font-extrabold text-amber-300 tabular-nums">{totalCoins}</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Skins List */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {skins.map((skin) => {
            const isEquipped = skin.id === activeSkinId;
            const canAfford = totalCoins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isEquipped
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Color palette indicator */}
                    <div className="flex -space-x-1.5">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-slate-900 shadow"
                        style={{ backgroundColor: skin.colors.jacket }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-slate-900 shadow"
                        style={{ backgroundColor: skin.colors.jacketAccent }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-slate-900 shadow"
                        style={{ backgroundColor: skin.colors.shoes }}
                      />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">{skin.name}</h3>
                      <p className="text-xs text-slate-400">{skin.description}</p>
                    </div>
                  </div>

                  {/* Status / Button */}
                  <div>
                    {isEquipped ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-orange-400 bg-orange-500/20 px-3 py-1.5 rounded-xl border border-orange-500/30">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    ) : skin.unlocked ? (
                      <button
                        onClick={() => {
                          sounds.playCoin();
                          onSelectSkin(skin);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-extrabold uppercase tracking-wider transition-colors"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          if (canAfford) {
                            sounds.playPowerup();
                            onUnlockSkin(skin.id, skin.cost);
                          }
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock {skin.cost} ★</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-400 text-center">
          Collect golden coins across rooftops to unlock legendary runner suits!
        </p>
      </div>
    </div>
  );
};
