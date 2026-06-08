<script lang="ts">
  import type { StatusVariant } from '$lib/types';

  let { variant, text }: { variant: StatusVariant; text: string } = $props();
</script>

<div class="status-indicator {variant}">
  {text}
</div>

<style>
  .status-indicator {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    border: 1px solid var(--border);
  }

  .status-indicator.white-turn {
    background: rgba(245, 238, 216, 0.1);
    color: var(--cream);
    border-color: rgba(245, 238, 216, 0.2);
  }

  .status-indicator.black-turn {
    background: rgba(40, 40, 60, 0.6);
    color: var(--text-secondary);
    border-color: rgba(100, 100, 140, 0.2);
  }

  .status-indicator.check {
    background: rgba(200, 60, 60, 0.15);
    color: #e07070;
    border-color: rgba(200, 60, 60, 0.3);
    animation: pulse-check 1s ease-in-out infinite alternate;
  }

  .status-indicator.checkmate {
    background: rgba(160, 80, 40, 0.2);
    color: var(--gold-light);
    border-color: rgba(196, 160, 87, 0.4);
  }
</style>
