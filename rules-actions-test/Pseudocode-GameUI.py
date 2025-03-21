class CoupUI:
    def __init__(self, game_engine):
        self.engine = game_engine
        self.current_player = None
        self.selected_action = None
        self.selected_target = None
        
        # UI Components
        self.player_panels = {}
        self.action_buttons = []
        self.response_buttons = []
        self.message_log = []
        self.card_reveal_overlay = None
        
    # Main UI Flow
    def main_loop(self):
        while True:
            if game.state == 'LOBBY':
                self.show_lobby_screen()
            elif game.state == 'PLAYING':
                self.show_game_board()
            elif game.state == 'GAME_OVER':
                self.show_game_over_screen()
                
    # Screen Definitions
    def show_game_board(self):
        while True:
            self.clear_screen()
            
            # Draw player panels
            for player in self.engine.players:
                self.draw_player_panel(
                    name=player.name,
                    coins=player.coins,
                    influences=player.influences.count,
                    is_current=(player == self.engine.current_player)
                )
                
            # Draw action controls
            if self.is_active_player():
                self.show_action_phase()
            else:
                self.show_response_phase()
                
            # Draw message log
            self.draw_message_log()
            
            # Handle input
            self.process_input()

    # UI Sections
    def show_action_phase(self):
        # Show available actions based on game state
        actions = self.get_available_actions()
        self.action_buttons = [
            Button(label=action.name, 
                   enabled=self.validate_action(action),
                   on_click=lambda: self.select_action(action))
            for action in VALID_ACTIONS
        ]
        
        if self.selected_action.requires_target:
            self.show_target_selection()
            
        if self.selected_action and self.selected_target:
            self.show_confirm_button()

    def show_response_phase(self):
        # Get response options from game engine
        response_options = self.engine.get_current_response_options()
        
        self.response_buttons = [
            Button(label=option.label, 
                   on_click=lambda: self.send_response(option))
            for option in response_options
        ]
        
        # Show challenge/block timer
        if response_options.timeout > 0:
            self.draw_response_timer()

    # UI Components
    def draw_player_panel(self, player):
        panel = Panel(
            header=f"{player.name} ({player.coins} coins)",
            content=[
                StatusIndicator(lives=player.influences.count),
                *[CardBack() if influence.hidden else InfluenceCard(influence.role) 
                  for influence in player.influences]
            ]
        )
        if player == self.engine.current_action.target:
            panel.add_highlight('target')
            
        self.player_panels[player.id] = panel

    # Input Handling
    def process_input(self):
        if click_event:
            if self.action_buttons.clicked:
                self.handle_action_click()
            elif self.response_buttons.clicked:
                self.handle_response_click()
            elif self.player_panels.clicked:
                self.handle_player_selection()

    # Game Engine Integration
    def get_available_actions(self):
        return self.engine.get_valid_actions(
            player=self.current_player,
            game_state=self.engine.state
        )

    def send_action(self, action, target=None):
        try:
            self.engine.handle_action(action, target)
            self.update_ui_state()
        except GameRuleError as e:
            self.show_error_message(e)

    def send_response(self, response):
        self.engine.process_response(
            player=self.current_player,
            response=response
        )
        self.update_ui_state()

    # Visual Effects
    def animate_coin_transfer(self, source, target, amount):
        coin_sprites = create_coin_sprites(amount)
        animate_movement(coin_sprites, from=source, to=target)

    def reveal_influence(self, player, influence):
        overlay = CardRevealOverlay(
            player=player.name,
            role=influence.role
        )
        self.show_overlay(overlay, duration=3)

    # State Updates
    def update_ui_state(self):
        # Update all visual elements based on game state
        self.update_player_panels()
        self.update_action_buttons()
        self.update_response_buttons()
        self.update_message_log()
        
        # Handle special states
        if self.engine.current_action.type == 'EXCHANGE':
            self.show_exchange_interface()

    # Specialized Interfaces
    def show_exchange_interface(self):
        exchange_ui = ExchangeScreen(
            current_cards=self.current_player.influences,
            new_cards=self.engine.drawn_exchange_cards,
            on_selection=lambda selected: self.finalize_exchange(selected)
        )
        self.show_modal(exchange_ui)

    def show_assassination_result(self, success):
        if success:
            self.animate_card_loss(target_player)
            self.play_sound('assassinate_success')
        else:
            self.animate_card_loss(initiator)
            self.play_sound('block_success')

    # Error Handling
    def show_error_message(self, message):
        error_popup = Dialog(
            title="Invalid Action",
            message=message,
            buttons=["OK"]
        )
        self.show_modal(error_popup)

    # Message Log
    def log_game_event(self, event):
        self.message_log.append(f"[{datetime.now()}] {event}")
        if len(self.message_log) > 100:
            self.message_log.pop(0)

# Example UI Flow Integration
ui = CoupUI(game_engine=my_game_engine)
ui.main_loop()