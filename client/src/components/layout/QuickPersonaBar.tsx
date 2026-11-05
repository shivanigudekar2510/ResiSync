import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { TEST_PERSONAS, TestPersona } from '../../data/testPersonas';
import { Users, Shield, Building2, Wrench, Cpu, Truck, Check } from 'lucide-react';

const roleIcons: Record<string, React.FC<{ className?: string }>> = {
  RESIDENT: Users,
  GUARD: Shield,
  RWA: Building2,
  FACILITY: Cpu,
  TECH: Wrench,
  VENDOR: Truck,
};

export const QuickPersonaBar: React.FC = () => {
  const { user, switchPersona, isLoading } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSwitch = async (persona: TestPersona) => {
    if (user?.email?.toLowerCase() === persona.email.toLowerCase()) {
      navigate(persona.defaultRoute);
      return;
    }

    try {
      const switchedUser = await switchPersona(persona.email, persona.password);
      if (switchedUser) {
        showToast({
          type: 'success',
          title: `Switched Persona: ${persona.roleTitle}`,
          message: `Active session set to ${persona.name} (${persona.unitOrPost}). Cross-role state synchronized.`,
        });
        navigate(persona.defaultRoute);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Switch Failed',
        message: err.message || 'Could not switch persona.',
      });
    }
  };

  return (
    <div className="bg-[#0B1118] border-b border-border/80 px-3 py-2 text-xs text-text-secondary select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Left Society Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span className="text-[11px] font-bold text-text-primary tracking-wide uppercase font-mono">
            Society: <span className="text-primary">EGO-BLR-01</span> • Emerald Greens
          </span>
          <span className="text-[10px] text-text-muted hidden sm:inline">| Quick Switch Persona:</span>
        </div>

        {/* Persona Buttons List */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {TEST_PERSONAS.map((persona) => {
            const Icon = roleIcons[persona.personaType] || Users;
            const isActive = user?.email?.toLowerCase() === persona.email.toLowerCase();

            return (
              <button
                key={persona.id}
                onClick={() => handleSwitch(persona)}
                disabled={isLoading}
                title={`${persona.roleTitle}: ${persona.name} (${persona.unitOrPost})\n${persona.testCodesSummary}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-primary text-background font-bold border-primary shadow-orange-glow'
                    : 'bg-surface/80 hover:bg-card border-border text-text-secondary hover:text-white hover:border-border/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-background' : 'text-primary'}`} />
                <span>
                  {persona.roleNumber}. {persona.name.split(' ')[0]} ({persona.unitOrPost.replace('Flat ', '')})
                </span>
                {isActive && <Check className="w-3 h-3 ml-0.5 text-background stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickPersonaBar;

