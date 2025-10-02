import React, { useState, useEffect } from "react";
import { Session } from "@/entities/Session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import SessionDetails from "../components/sessions/sessiondetails";
import { User } from "@/entities/User";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await User.me();
    setUser(currentUser);
    const allSessions = await Session.list("-date_time");
    setSessions(allSessions);
    setLoading(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter((session) =>
      isSameDay(parseISO(session.date_time), day)
    );
  };

  const handleCancelSession = async (sessionId, reason) => {
    await Session.update(sessionId, {
      status: "cancelled",
      cancellation_reason: reason,
    });
    setSelectedSession(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar View</h1>
            <p className="text-slate-600 mt-1">
              View all scheduled sessions in calendar format
            </p>
          </div>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader className="border-b border-slate-100 p-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-slate-600 text-sm py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array(monthStart.getDay())
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

              {daysInMonth.map((day) => {
                const daySessions = getSessionsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-24 p-2 border rounded-lg ${
                      isToday
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        isToday ? "text-emerald-700" : "text-slate-700"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {daySessions.slice(0, 2).map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="w-full text-left p-1 rounded text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 truncate transition-colors"
                        >
                          {format(parseISO(session.date_time), "h:mm a")} {session.title}
                        </button>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-slate-500 pl-1">
                          +{daySessions.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedSession && (
        <SessionDetails
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onCancel={handleCancelSession}
          currentUser={user}
        />
      )}
    </div>
  );
}