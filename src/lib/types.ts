// ─────────────────────────────────────────────────────────────────────────────
// CHESS PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Side of the board */
export type Color = 'w' | 'b';

/** Piece type letter */
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

/**
 * Two-character piece code: color + type.
 * Examples: 'wK', 'bQ', 'wP', 'bN'
 */
export type PieceCode = `${Color}${PieceType}`;

/** A null-able cell on the board */
export type Cell = PieceCode | null;

/** 8×8 board grid */
export type Board = Cell[][];

/** [rank, file] zero-indexed coordinate */
export type Square = [number, number];

/**
 * A raw or legal move tuple.
 * [toRank, toFile, flag?]
 * flag is used for castling: 'castle-K' | 'castle-Q'
 */
export type MoveFlag = 'castle-K' | 'castle-Q';
export type RawMove = [number, number, MoveFlag?];

/** A fully-qualified move as stored in history */
export interface MoveRecord {
  fr: number;
  ff: number;
  tr: number;
  tf: number;
  piece: PieceCode;
  captured: PieceCode | null;
  promo: PieceType | null;
}

/** Castling rights tracker */
export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────────────────────────────────────

/** Core game state shared between AI and PvP modes */
export interface GameState {
  board: Board;
  turn: Color;
  selected: Square | null;
  legalMoves: RawMove[];
  moveHistory: MoveRecord[];
  castlingRights: CastlingRights;
  enPassantSquare: Square | null;
  capturedByWhite: PieceCode[];
  capturedByBlack: PieceCode[];
  isGameOver: boolean;
}

/** PvP-specific extension of GameState */
export interface PvpState extends GameState {
  p1Wins: number;
  p2Wins: number;
  gameHistory: GameHistoryEntry[];
}

/** One completed game result stored in PvP session */
export interface GameHistoryEntry {
  winner: 'Player 1' | 'Player 2' | 'Draw';
  result: 'Checkmate' | 'Stalemate' | 'Resign';
}

// ─────────────────────────────────────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────────────────────────────────────

/** AI difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'intermediate' | 'hard';

/** Tuple the AI engine returns: [fromRank, fromFile, toRank, toFile, promo?] */
export type AIMove = [number, number, number, number, PieceType | null];

// ─────────────────────────────────────────────────────────────────────────────
// PENDING PROMOTION
// ─────────────────────────────────────────────────────────────────────────────

/** Data captured when a pawn reaches the promotion rank */
export interface PendingPromotion {
  fr: number;
  ff: number;
  tr: number;
  tf: number;
  color: Color;
  mode: GameMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION / VIEWS
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level views available in the app */
export type ViewId = 'dashboard' | 'ai-play' | 'pvp' | 'learn' | 'progress';

/** Current game mode context */
export type GameMode = 'ai' | 'pvp';

/** Metadata for a nav item */
export interface NavItem {
  id: ViewId | 'progress' | 'settings';
  icon: string;
  label: string;
  section: 'Main' | 'Learn' | 'Account';
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATUS / STATUS INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

export type StatusVariant = 'white-turn' | 'black-turn' | 'check' | 'checkmate';

export interface StatusState {
  variant: StatusVariant;
  text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME OVER
// ─────────────────────────────────────────────────────────────────────────────

export interface GameOverState {
  visible: boolean;
  icon: string;
  title: string;
  subtitle: string;
  mode: GameMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOARD DISPLAY OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface BoardOptions {
  showHints: boolean;
  showLastMove: boolean;
  showLabels: boolean;
  autoFlip: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING HUB
// ─────────────────────────────────────────────────────────────────────────────

export type LearnTabId = 'pieces' | 'openings' | 'rules' | 'scenarios';

export interface LearnTab {
  id: LearnTabId;
  icon: string;
  label: string;
}

/** A scenario (mini board puzzle) in the Learning Hub */
export interface Scenario {
  id: ScenarioId;
  type: 'Tactic' | 'Pattern' | 'Endgame';
  title: string;
  description: string;
  board: Board;
}

export type ScenarioId = 'scholars' | 'fork' | 'pin' | 'endgame' | 'castling' | 'promotion';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export interface MetricCard {
  icon: string;
  value: string;
  label: string;
}

export interface PillarCard {
  targetView: ViewId;
  iconWrapClass: 'gold' | 'blue' | 'teal';
  icon: string;
  title: string;
  description: string;
  tags: Array<{ label: string; cls: 'easy' | 'med' | 'int' | 'hard' }>;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PIECE DATA (Learning Hub)
// ─────────────────────────────────────────────────────────────────────────────

export interface PieceData {
  symbol: string;
  name: string;
  valueBadgeClass: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  valueLabel: string;
  moveDescription: string;
  strategyTip: string;
}

export interface OpeningData {
  eco: string;
  title: string;
  moves: string;
  description: string;
}

export interface RuleData {
  icon: string;
  title: string;
  text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  initials: string;
  name: string;
  rank: string;
  elo: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVELTE COMPONENT PROP TYPES (re-exported for convenience)
// ─────────────────────────────────────────────────────────────────────────────

/** Props for the ChessBoard component */
export interface ChessBoardProps {
  state: GameState;
  mode: GameMode;
  options: BoardOptions;
  onSquareClick: (rank: number, file: number) => void;
}

/** Props for the StatusIndicator component */
export interface StatusIndicatorProps {
  variant: StatusVariant;
  text: string;
}

/** Props for the MiniBoard component */
export interface MiniBoardProps {
  board: Board;
}

/** Props for a PlayerStrip in PvP mode */
export interface PlayerStripProps {
  piece: string;
  name: string;
  colorLabel: string;
  isActive: boolean;
}
