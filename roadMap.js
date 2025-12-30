/*
====================================================
Bingo Game System Flow (MERN + Socket.IO)
====================================================

-------------------------
Step 1: User Login
-------------------------

1. User opens the app → Login Page.
2. User enters credentials (email/username + password).
3. Client sends credentials to backend:
   POST /login

4. Backend verifies credentials:
   ✅ Valid → returns JWT token + userId
   ❌ Invalid → returns error message

5. Client stores:
   - token
   - userId
   in localStorage for session persistence.

6. User is redirected to Lobby Page.


-------------------------
Step 2: Lobby Page & Bid Submission
-------------------------

1. User selects a bid amount and clicks "Join Game".

2. Client emits Socket.IO event:
   selected_bid_event

   Payload:
   {
     userId: "12345",
     bidAmount: 100
   }

3. Backend checks:
   - Is there an existing game session with this bidAmount?

   ✅ Yes → Add user to that session
   ❌ No  → Create a new game session

4. GameSession Structure:

   {
     status: "waiting | ongoing | completed",
     players: ["userId1", "userId2", ...],
     reservedCards: [1, 2, 3, ...],
     cards: [
       { id: 1, numbers: {...} },
       { id: 2, numbers: {...} },
       ...
     ],
     randomNumbersList: [
       { B: 12 }, { I: 25 }, ... up to 75 numbers
     ],
     calledNumbersList: []
   }

5. Backend registers the user:
   - Deducts bidAmount from user balance
   - Adds user to Socket.IO room:
     socket.join(gameSession._id)

6. Backend emits to room:
   updateGameSession

   Includes:
   - players list
   - reserved cards
   - bid information

7. Card Reservation:
   - User selects a card
   - Backend marks card as reserved
   - Emits updated session to all players

8. Countdown Trigger Condition:
   if (players.length >= 2 && reservedCards.length >= 2)

   Emit:
   countdownEvent
   {
     duration: 10
   }


-------------------------
Step 3: Countdown Page
-------------------------

1. Clients receive countdownEvent.
2. Redirected to Countdown Page.
3. Timer runs (e.g., 10 seconds).
4. Backend monitors active connections.
5. On timer completion → redirect to Game Page.


-------------------------
Step 4: Game Page & Start
-------------------------

1. Each client emits:
   gameStartEvent

2. Backend verifies:
   - All players are connected and active

3. Backend generates or retrieves:
   randomNumbersList (75 Bingo numbers)

4. Backend starts calling numbers sequentially:
   - Adds number to calledNumbersList
   - Emits called number to all clients

5. Real-time checks:
   - Ping-pong heartbeats
   - Handle player disconnects


-------------------------
Step 5: Gameplay
-------------------------

1. Players mark numbers on their reserved Bingo card.
2. Players compare marked numbers with calledNumbersList.

3. When a player claims Bingo:
   Client emits:

   {
     userCardId: 5,
     selectedNumbers: [ ... ]
   }

4. Backend validates:
   - All numbers exist on user's card
   - All numbers exist in calledNumbersList

5. If claim is valid:
   - Calculate winnings
   - Deduct from losers
   - Add to winner
   - Take admin percentage
   - Set gameSession.status = "completed"

6. Backend emits:
   gameOverEvent

   {
     winnerName: "Player1",
     winningCardId: 5,
     prize: 300,
     updatedBalances: {
       Player1: 500,
       Player2: 200
     }
   }


-------------------------
Step 6: Game Over Handling
-------------------------

1. Clients receive gameOverEvent.
2. Winner → redirected to Winner Page.
3. Others → redirected to Loser Page.
4. After acknowledgment:
   - All players return to Lobby Page.


-------------------------
Step 7: Payment & Insufficient Balance
-------------------------

1. User tries to join game but balance < bidAmount.
2. Redirect to Payment Page.
3. User recharges account.
4. On successful transaction:
   - Update user balance
   - Redirect to Transaction History Page
   - Then return to Lobby Page.


-------------------------
Summary of Key Concepts
-------------------------

• Socket Rooms:
  io.to(gameSession._id) broadcasts updates per session.

• Real-time Events:
  - selected_bid_event
  - updateGameSession
  - countdownEvent
  - gameStartEvent
  - gameOverEvent

• Database (MongoDB):
  - Users
  - GameSessions
  - Cards
  - Random numbers
  - Called numbers
  - Balances

• Frontend Flow:
  Login → Lobby → Countdown → Game → Winner/Loser → Lobby

• Backend Responsibilities:
  - Validation
  - Real-time broadcasting
  - Session lifecycle
  - Payout calculations
  - State management

====================================================
END OF DOCUMENT
====================================================
*/
