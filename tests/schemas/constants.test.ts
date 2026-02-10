/**
 * Tests for schema constants
 */

import {
  ToolNames,
  ModelNames,
  PermissionActions,
  HookEvents,
  HookTypes,
  ContextModes,
  TransportTypes,
  ScriptExtensions,
  VALID_TOOLS,
  VALID_MODELS,
  VALID_PERMISSION_ACTIONS,
  VALID_HOOK_EVENTS,
  VALID_HOOK_TYPES,
  VALID_CONTEXTS,
  VALID_MCP_TRANSPORT_TYPES,
  SCRIPT_EXTENSIONS,
} from '../../src/schemas/constants';

describe('Schema Constants', () => {
  describe('ToolNames', () => {
    it('should validate valid tool names', () => {
      expect(ToolNames.safeParse('Bash').success).toBe(true);
      expect(ToolNames.safeParse('Read').success).toBe(true);
      expect(ToolNames.safeParse('Task').success).toBe(true);
      expect(ToolNames.safeParse('Skill').success).toBe(true);
    });

    it('should reject invalid tool names', () => {
      expect(ToolNames.safeParse('InvalidTool').success).toBe(false);
      expect(ToolNames.safeParse('bash').success).toBe(false);
      expect(ToolNames.safeParse('').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(VALID_TOOLS).toContain('Bash');
      expect(VALID_TOOLS).toContain('Read');
      expect(VALID_TOOLS).toContain('Task');
      expect(VALID_TOOLS.length).toBeGreaterThan(0);
    });
  });

  describe('ModelNames', () => {
    it('should validate valid model names', () => {
      expect(ModelNames.safeParse('sonnet').success).toBe(true);
      expect(ModelNames.safeParse('opus').success).toBe(true);
      expect(ModelNames.safeParse('haiku').success).toBe(true);
      expect(ModelNames.safeParse('inherit').success).toBe(true);
    });

    it('should reject invalid model names', () => {
      expect(ModelNames.safeParse('gpt-4').success).toBe(false);
      expect(ModelNames.safeParse('Sonnet').success).toBe(false);
      expect(ModelNames.safeParse('').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(VALID_MODELS).toEqual(['sonnet', 'opus', 'haiku', 'inherit']);
    });
  });

  describe('PermissionActions', () => {
    it('should validate valid permission actions', () => {
      expect(PermissionActions.safeParse('allow').success).toBe(true);
      expect(PermissionActions.safeParse('ask').success).toBe(true);
      expect(PermissionActions.safeParse('deny').success).toBe(true);
    });

    it('should reject invalid permission actions', () => {
      expect(PermissionActions.safeParse('reject').success).toBe(false);
      expect(PermissionActions.safeParse('Allow').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(VALID_PERMISSION_ACTIONS).toEqual(['allow', 'ask', 'deny']);
    });
  });

  describe('HookEvents', () => {
    it('should validate valid hook events', () => {
      expect(HookEvents.safeParse('PreToolUse').success).toBe(true);
      expect(HookEvents.safeParse('PostToolUse').success).toBe(true);
      expect(HookEvents.safeParse('SessionStart').success).toBe(true);
      expect(HookEvents.safeParse('SessionEnd').success).toBe(true);
    });

    it('should reject invalid hook events', () => {
      expect(HookEvents.safeParse('BeforeToolUse').success).toBe(false);
      expect(HookEvents.safeParse('pretooluse').success).toBe(false);
    });

    it('should export all 15 events', () => {
      expect(VALID_HOOK_EVENTS.length).toBe(15);
      expect(VALID_HOOK_EVENTS).toContain('PreToolUse');
      expect(VALID_HOOK_EVENTS).toContain('SessionEnd');
      expect(VALID_HOOK_EVENTS).toContain('TeammateIdle');
      expect(VALID_HOOK_EVENTS).toContain('TaskCompleted');
    });
  });

  describe('HookTypes', () => {
    it('should validate valid hook types', () => {
      expect(HookTypes.safeParse('command').success).toBe(true);
      expect(HookTypes.safeParse('prompt').success).toBe(true);
      expect(HookTypes.safeParse('agent').success).toBe(true);
    });

    it('should reject invalid hook types', () => {
      expect(HookTypes.safeParse('script').success).toBe(false);
      expect(HookTypes.safeParse('Command').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(VALID_HOOK_TYPES).toEqual(['command', 'prompt', 'agent']);
    });
  });

  describe('ContextModes', () => {
    it('should validate valid context modes', () => {
      expect(ContextModes.safeParse('fork').success).toBe(true);
      expect(ContextModes.safeParse('inline').success).toBe(true);
      expect(ContextModes.safeParse('auto').success).toBe(true);
    });

    it('should reject invalid context modes', () => {
      expect(ContextModes.safeParse('spawn').success).toBe(false);
      expect(ContextModes.safeParse('Fork').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(VALID_CONTEXTS).toEqual(['fork', 'inline', 'auto']);
    });
  });

  describe('TransportTypes', () => {
    it('should validate valid transport types', () => {
      expect(TransportTypes.safeParse('stdio').success).toBe(true);
      expect(TransportTypes.safeParse('sse').success).toBe(true);
      expect(TransportTypes.safeParse('http').success).toBe(true);
      expect(TransportTypes.safeParse('websocket').success).toBe(true);
    });

    it('should reject invalid transport types', () => {
      expect(TransportTypes.safeParse('tcp').success).toBe(false);
      expect(TransportTypes.safeParse('STDIO').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(VALID_MCP_TRANSPORT_TYPES).toEqual([
        'stdio',
        'sse',
        'http',
        'websocket',
      ]);
    });
  });

  describe('ScriptExtensions', () => {
    it('should validate valid script extensions', () => {
      expect(ScriptExtensions.safeParse('.sh').success).toBe(true);
      expect(ScriptExtensions.safeParse('.py').success).toBe(true);
      expect(ScriptExtensions.safeParse('.js').success).toBe(true);
    });

    it('should reject invalid extensions', () => {
      expect(ScriptExtensions.safeParse('.ts').success).toBe(false);
      expect(ScriptExtensions.safeParse('sh').success).toBe(false);
      expect(ScriptExtensions.safeParse('.SH').success).toBe(false);
    });

    it('should export runtime values', () => {
      expect(SCRIPT_EXTENSIONS).toEqual(['.sh', '.py', '.js']);
    });
  });

  describe('Runtime values match schemas', () => {
    it('should have matching tool names', () => {
      const schemaOptions = ToolNames.options;
      expect(VALID_TOOLS).toEqual(schemaOptions);
    });

    it('should have matching model names', () => {
      const schemaOptions = ModelNames.options;
      expect(VALID_MODELS).toEqual(schemaOptions);
    });

    it('should have matching permission actions', () => {
      const schemaOptions = PermissionActions.options;
      expect(VALID_PERMISSION_ACTIONS).toEqual(schemaOptions);
    });

    it('should have matching hook events', () => {
      const schemaOptions = HookEvents.options;
      expect(VALID_HOOK_EVENTS).toEqual(schemaOptions);
    });

    it('should have matching hook types', () => {
      const schemaOptions = HookTypes.options;
      expect(VALID_HOOK_TYPES).toEqual(schemaOptions);
    });

    it('should have matching context modes', () => {
      const schemaOptions = ContextModes.options;
      expect(VALID_CONTEXTS).toEqual(schemaOptions);
    });

    it('should have matching transport types', () => {
      const schemaOptions = TransportTypes.options;
      expect(VALID_MCP_TRANSPORT_TYPES).toEqual(schemaOptions);
    });

    it('should have matching script extensions', () => {
      const schemaOptions = ScriptExtensions.options;
      expect(SCRIPT_EXTENSIONS).toEqual(schemaOptions);
    });
  });
});
